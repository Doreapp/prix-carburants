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
DEPARTMENTS = (
    [f"{dept:02}" for dept in range(1, 20)] + ["2A", "2B"] + [str(dept) for dept in range(21, 96)]
)


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


def get_department_index(postcode: int) -> int:
    """Return the department index given a ``postcode``"""
    postcode = int(postcode)
    if postcode < 20000:  # Before Corsica
        return int(postcode / 1000) - 1
    if postcode < 20200:  # Corsica 2A
        return 19
    if postcode < 21000:  # Corsica 2B
        return 20
    return int(postcode / 1000)  # After Corsica


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
    # [fuel_type -> [department -> value]]
    counts = [[0] * len(DEPARTMENTS) for _ in range(len(FuelType))]
    totals = [[-1] * len(DEPARTMENTS) for _ in range(len(FuelType))]
    for sale_point in sale_points:
        department = get_department_index(sale_point[3])  # [3] for postcode
        for fuel_type, price in enumerate(sale_point[5:]):  # [5+] for prices
            if price == -1:
                continue
            totals[fuel_type][department] += price
            counts[fuel_type][department] += 1
    averages = []
    averages_global = []
    for fuel_type in range(len(FuelType)):
        fuel_type_averages = []
        for department in range(len(DEPARTMENTS)):
            number = counts[fuel_type][department]
            if number == 0:
                fuel_type_averages.append(-1)
            else:
                fuel_type_averages.append(totals[fuel_type][department] / number)
        averages.append(fuel_type_averages)
        count = sum(counts[fuel_type][dept] for dept in range(len(DEPARTMENTS)))
        total = sum(max(0, totals[fuel_type][dept]) for dept in range(len(DEPARTMENTS)))
        averages_global.append(total / count)
    return {
        "averages_by_departments": averages,
        "averages_global": averages_global,
        "fuel_types": [type.name for type in FuelType],
        "departments": DEPARTMENTS,
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
