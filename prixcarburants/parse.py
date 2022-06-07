"""
Parser of data from https://www.prix-carburants.gouv.fr/rubrique/opendata/
"""

import json
import logging
import os
import xml.etree.ElementTree as ET
from datetime import datetime
from enum import Enum
from typing import Dict, List

from .models import FuelType, SalePoint

LOGGER = logging.getLogger(os.path.basename(__file__))
DEPARTMENTS = list(range(1, 96))


def build_sale_points(filename: str) -> List[SalePoint]:
    """
    Build sale points from file
    :param filename: Name of the file to parse
    :return: Sale points parsed
    """
    LOGGER.info("Building sale points from %s", filename)
    with open(filename, "r", encoding="windows-1252") as stream:
        tree = ET.parse(stream)
    root = tree.getroot()
    return [SalePoint.build(element) for element in root]


def build_metrics(sale_points: List[dict]) -> dict:
    """
    Extract metrics from latest data.
    Given ``sale_points`` should have been extracted using ``degrade_to_latest()`` function.
    :param sale_points: List of degraded sale points or
        a dict containing this list under ``data`` attribute.
    :return: Dictionary of metrics
    """
    if isinstance(sale_points, dict):
        sale_points = sale_points["data"]
    LOGGER.debug("Building metrics over %s sale points", len(sale_points))
    counts = {department: [0] * len(FuelType) for department in DEPARTMENTS}
    totals = {department: [-1] * len(FuelType) for department in DEPARTMENTS}
    for sale_point in sale_points:
        department = int(sale_point[3][:2])  # 3 for postcode
        for fuel_type, price in enumerate(sale_point[5:]):  # 5 for prices
            if price == -1:
                continue
            totals[department][fuel_type] += price
            counts[department][fuel_type] += 1
    counts["total"] = [
        sum(counts[department][fuel_type] for department in DEPARTMENTS)
        for fuel_type in range(len(FuelType))
    ]
    totals["total"] = [
        sum(totals[department][fuel_type] for department in DEPARTMENTS)
        for fuel_type in range(len(FuelType))
    ]
    averages = {department: [-1] * len(FuelType) for department in DEPARTMENTS + ["total"]}
    for department, total in totals.items():
        for fuel_type, price in enumerate(FuelType):
            price = total[fuel_type]
            if price == -1:
                averages[department][fuel_type] = -1
            else:
                averages[department][fuel_type] = price / counts[department][fuel_type]
    return {
        "metrics": {"averages": averages, "counts": counts},
        "fuel_types": [type.name for type in FuelType],
    }


def degrade_to_latest(sale_points: List[SalePoint]) -> Dict[str, List]:
    """
    Degrade sales points to keep only meaningful latest data.
    :param sale_points: List of sale points to degrade
    :return: List of degraded sale points.
        ``keys`` attribute provides names of the fields.
        ``data`` attributes contains a list of degraded sale points, as lists.
    """
    LOGGER.debug("Degrading to latest %s points", len(sale_points))
    results = []
    for sale_point in sale_points:
        degraded = [
            float(sale_point.location.latitude),
            float(sale_point.location.longitude),
            sale_point.address.address,
            sale_point.address.postcode,
            sale_point.address.city,
        ]
        for fuel_type in FuelType:
            fuel_prices = sale_point.prices.get(fuel_type.value, [])
            if len(fuel_prices) > 0:
                degraded.append(max(fuel_prices, key=lambda price: price[1])[1])  # Newer
            else:
                degraded.append(-1)
        results.append(degraded)
    return {
        "keys": ("latitude", "longitude", "address", "postcode", "city")
        + tuple((fuel_type.name for fuel_type in FuelType)),
        "data": results,
    }


class ClassEncoder(json.JSONEncoder):
    """Encoder that handles custom classes"""

    def default(self, o):
        if isinstance(o, set):
            return list(o)
        if isinstance(o, datetime):
            return str(o)
        if isinstance(o, Enum):
            return o.value
        return o.__dict__


def save_as_json(obj, output_file: str):
    """
    Save ``obj`` in ``output_file`` as a json.
    :param obj: Object to save
    :param output_file: Path to the file to write in.
        May create a file or override the existing file
    """
    LOGGER.debug("Saving a json in %s", output_file)
    with open(output_file, "w", encoding="utf8") as stream:
        json.dump(obj, stream, cls=ClassEncoder)
