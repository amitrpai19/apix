"""
Econometric Index Engine for APIx-India
Implements Jevons Elementary Aggregation, Booking Curve Weighting,
and Modified Laspeyres / Young Index construction according to IMF/ILO CPI guidelines.
"""

import math
from typing import List, Dict, Any, Tuple

# Standard Empirical Booking Curve weights from DGCA domestic air travel study
DEFAULT_BETA_WEIGHTS: Dict[int, float] = {
    1: 0.15,   # T+1: Urgent / Emergency corporate travel
    7: 0.30,   # T+7: Peak short-term domestic business/leisure
    15: 0.30,  # T+15: Optimal planned domestic travel
    30: 0.15,  # T+30: Early vacation / holiday bookings
    45: 0.10   # T+45: Deep advance festival bookings
}

def filter_iqr_outliers(prices: List[float]) -> Tuple[List[float], List[float]]:
    """
    Applies Interquartile Range (IQR) filter per (route, lead_window) stratum:
    Valid quotes: p in [Q1 - 1.5 * IQR, Q3 + 1.5 * IQR]
    """
    if len(prices) < 4:
        return prices, []
    
    sorted_p = sorted(prices)
    n = len(sorted_p)
    q1 = sorted_p[int(n * 0.25)]
    q3 = sorted_p[int(n * 0.75)]
    iqr = q3 - q1
    lower_bound = max(500.0, q1 - 1.5 * iqr)
    upper_bound = q3 + 1.5 * iqr
    
    valid = [p for p in prices if lower_bound <= p <= upper_bound]
    outliers = [p for p in prices if p < lower_bound or p > upper_bound]
    return valid if valid else prices, outliers

def calculate_jevons_index(prices: List[float]) -> float:
    """
    Elementary Aggregation: Unweighted Geometric Mean (Jevons Index).
    P_bar_{r,tau}^t = (prod_{k=1}^N p_{r,tau,k}^t)^(1/N) = exp(1/N * sum(ln(p)))
    Prevents upward substitution bias present in Dutot/Carli arithmetic averages.
    """
    if not prices:
        return 0.0
    valid_prices = [p for p in prices if p > 0]
    if not valid_prices:
        return 0.0
    log_sum = sum(math.log(p) for p in valid_prices)
    return math.exp(log_sum / len(valid_prices))

def calculate_route_composite_price(
    lead_window_prices: Dict[int, List[float]], 
    beta_weights: Dict[int, float] = None
) -> Dict[str, Any]:
    """
    Aggregates advance booking buckets using empirical booking curve shares (beta_tau).
    P_bar_r^t = prod_{tau} (P_bar_{r,tau}^t)^(beta_tau)
    """
    if beta_weights is None:
        beta_weights = DEFAULT_BETA_WEIGHTS

    window_geometric_means: Dict[int, float] = {}
    cleaned_window_quotes: Dict[int, List[float]] = {}
    outliers_detected: Dict[int, List[float]] = {}

    for tau, quotes in lead_window_prices.items():
        valid_quotes, outliers = filter_iqr_outliers(quotes)
        cleaned_window_quotes[tau] = valid_quotes
        outliers_detected[tau] = outliers
        geom_mean = calculate_jevons_index(valid_quotes)
        window_geometric_means[tau] = geom_mean

    # Weighted Geometric Mean across advance purchase windows
    total_log = 0.0
    total_weight = 0.0
    for tau, weight in beta_weights.items():
        if tau in window_geometric_means and window_geometric_means[tau] > 0:
            total_log += weight * math.log(window_geometric_means[tau])
            total_weight += weight

    composite_price = math.exp(total_log / total_weight) if total_weight > 0 else 0.0

    return {
        "composite_price": round(composite_price, 2),
        "window_geometric_means": {k: round(v, 2) for k, v in window_geometric_means.items()},
        "outliers_count": sum(len(v) for v in outliers_detected.values())
    }

def calculate_laspeyres_apix(
    route_current_prices: Dict[str, float],
    route_base_prices: Dict[str, float],
    route_weights: Dict[str, float]
) -> float:
    """
    Upper-Level Aggregation: Modified Laspeyres / Young Index:
    APIx_t = sum_{r in R} W_r * (P_bar_r^t / P_bar_r^0) * 100
    Where W_r is the DGCA RPKM expenditure share weight.
    """
    total_index = 0.0
    weight_sum = 0.0
    for route_id, current_p in route_current_prices.items():
        base_p = route_base_prices.get(route_id, current_p)
        weight = route_weights.get(route_id, 0.0)
        if base_p > 0:
            price_rel = (current_p / base_p)
            total_index += weight * price_rel
            weight_sum += weight

    if weight_sum > 0:
        normalized_index = (total_index / weight_sum) * 100.0
    else:
        normalized_index = 100.0

    return round(normalized_index, 2)

def econometric_factor_decomposition(
    current_apix: float,
    previous_apix: float,
    atf_price_pct_change: float,
    is_festival_window: bool,
    lead_compression_ratio: float = 1.0
) -> Dict[str, float]:
    """
    Econometric Decomposition (Stage 6):
    Explains daily/weekly index shifts into causal drivers:
    - Aviation Turbine Fuel (ATF) pass-through elasticity (~35% of total airline cost)
    - Seasonal/Festival surges
    - Advance booking compression (T+1 vs T+15 shift)
    - Residual / Operational noise
    """
    total_delta = current_apix - previous_apix

    # Economic elasticities
    atf_elasticity = 0.38
    festival_impact = 1.25 if is_festival_window else 0.0
    lead_impact = (lead_compression_ratio - 1.0) * 0.85

    atf_contrib = (atf_price_pct_change * atf_elasticity)
    atf_contrib = max(-3.0, min(3.0, atf_contrib))
    
    assigned_sum = atf_contrib + festival_impact + lead_impact
    residual = round(total_delta - assigned_sum, 2)

    return {
        "total_delta_points": round(total_delta, 2),
        "atf_fuel_impact": round(atf_contrib, 2),
        "festival_demand_impact": round(festival_impact, 2),
        "lead_time_shift_impact": round(lead_impact, 2),
        "residual_market_noise": residual
    }
