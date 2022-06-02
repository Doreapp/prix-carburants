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
    prices = {fuel_type.value: [0, 0] for fuel_type in FuelType}
    for sale_point in sale_points:
        for key, (_, price) in sale_point["prices"].items():
            prices[key][0] += price
            prices[key][1] += 1
    averages = {}
    counts = {}
    totals = {}
    for fuel_type, (total, count) in prices.items():
        counts[fuel_type] = count
        if count == 0:
            averages[fuel_type] = -1
            totals[fuel_type] = -1
        else:
            averages[fuel_type] = total / count
            totals[fuel_type] = total
    return {
        "metrics": {
            "averages": averages,
            "counts": counts,
            "totals": totals,
        },
        "week_days": {day.value: day.name for day in WeekDay},
        "fuel_types": {type.value: type.name for type in FuelType},
        "sale_points": sale_points,
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
