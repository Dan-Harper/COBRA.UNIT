def calculate_likelihoods(data, target_likelihoods):
    """
    Calculate prices corresponding to specific likelihoods from the provided data.

    Args:
        data (pd.DataFrame): DataFrame containing the price data (e.g., low or close prices).
        target_likelihoods (list of int): List of target likelihoods (e.g., [85, 90]).

    Returns:
        dict: A dictionary with likelihoods as keys and corresponding prices as values.
    """
    likelihood_prices = {}
    for likelihood in target_likelihoods:
        # Calculate the price at the given likelihood (percentile)
        threshold_price = data["l"].quantile(likelihood / 100)  # Use the 'low' column for likelihoods
        likelihood_prices[f"{likelihood}%"] = threshold_price
    return likelihood_prices
