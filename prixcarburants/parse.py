"""
Parser of data from https://www.prix-carburants.gouv.fr/rubrique/opendata/
"""

import json
import logging
import os
import xml.etree.ElementTree as ET
from datetime import datetime
from enum import Enum
from typing import List

from .models import FuelType, SalePoint, WeekDay

LOGGER = logging.getLogger(os.path.basename(__file__))
DEPARTMENTS = list(range(1, 96))


def build_sale_points(filename: str) -> List[SalePoint]:
    """
    Build sale points from file
    :param filename: Name of the file to parse
    :return: Sale points parsed
    """
    LOGGER.info("Building sale points from %f", filename)
    with open(filename, "r", encoding="windows-1252") as stream:
        tree = ET.parse(stream)
    root = tree.getroot()
    return [SalePoint.build(element) for element in root]


def build_metrics(sale_points: List[dict]) -> dict:
    """
    Extract metrics from latest ``sale_points``
    """
    prices = {
        department: {fuel_type.value: [0, 0] for fuel_type in FuelType}
        for department in DEPARTMENTS
    }
    for sale_point in sale_points:
        for fuel_type, (_, price) in sale_point["prices"].items():
            department = int(sale_point["postcode"][:2])
            prices[department][fuel_type][0] += price
            prices[department][fuel_type][1] += 1
    prices["total"] = {
        fuel_type.value: [
            sum(prices[department][fuel_type.value][0] for department in DEPARTMENTS),
            sum(prices[department][fuel_type.value][1] for department in DEPARTMENTS),
        ]
        for fuel_type in FuelType
    }
    all_keys = ["total"]
    all_keys.extend(DEPARTMENTS)
    averages = {
        department: {fuel_type.value: -1 for fuel_type in FuelType} for department in all_keys
    }
    counts = {department: {fuel_type.value: 0 for fuel_type in FuelType} for department in all_keys}
    totals = {
        department: {fuel_type.value: -1 for fuel_type in FuelType} for department in all_keys
    }
    for department, sub_prices in prices.items():
        for fuel_type, (total, count) in sub_prices.items():
            counts[department][fuel_type] = count
            if count != 0:
                averages[department][fuel_type] = total / count
                totals[department][fuel_type] = total
    return {
        "metrics": {
            "averages": averages,
            "counts": counts,
            "totals": totals,
        },
        "week_days": {day.value: day.name for day in WeekDay},
        "fuel_types": {type.value: type.name for type in FuelType},
    }


def degrade_to_latest(sale_points: List[SalePoint]) -> List[dict]:
    """
    Degrade sales points to keep only meaningful latest data.
    """
    results = []
    for sale_point in sale_points:
        prices = {}
        for key, values in sale_point.prices.items():
            if len(values) > 0:
                prices[key] = max(values, key=lambda value: value[1])  # Newer
        results.append(
            {
                "id": sale_point.id,
                "lat": sale_point.location.latitude,
                "lng": sale_point.location.longitude,
                "address": sale_point.address.address,
                "postcode": sale_point.address.postcode,
                "city": sale_point.address.city,
                "prices": prices,
            }
        )
    return results


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
    LOGGER.debug("Saving a json in %f", output_file)
    with open(output_file, "w", encoding="utf8") as stream:
        json.dump(obj, stream, cls=ClassEncoder)
