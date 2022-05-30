"""
Models
"""

import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class WeekDay(Enum):
    """Day of the week"""

    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7


class FuelType(Enum):
    """Type of fuel"""

    GAZOLE = 1
    SP95 = 2
    E85 = 3
    GPLC = 4
    E10 = 5
    SP98 = 6


@dataclass
class Location:
    """GPS location"""

    latitude: float
    longitude: float


@dataclass
class Address:
    """Human-readable address"""

    postcode: int
    address: str
    city: str


@dataclass
class OutOfOrder:
    """Fuel out of order"""

    fuel_type: FuelType
    start_time: datetime
    end_time: Optional[datetime] = None

    @staticmethod
    def build(element: ET.Element):
        """Build an OutOfOrder from an XML element"""
        fuel_type = FuelType[element.get("nom").upper()]
        start_time = parse_iso_datetime(element.get("debut"))
        end_time_str = element.get("fin", "")
        end_time = None if len(end_time_str) == 0 else parse_iso_datetime(end_time_str)
        return OutOfOrder(fuel_type, start_time, end_time)


@dataclass
class ClosingTime:
    """Period where the sale point is closed"""

    start_time: datetime
    end_time: Optional[datetime] = None

    @staticmethod
    def build(element: ET.Element):
        """Build an ClosingTime from an XML element"""
        temporary = element.get("type") == "T"
        end_time = None
        if not temporary and len(element.get("fin", "")) > 0:
            end_time = parse_iso_datetime(element.get("fin"))
        start_time = parse_iso_datetime(element.get("debut"))
        return ClosingTime(start_time, end_time)


@dataclass
class WorkDay:
    """Day of work for a sale point. With opening hours."""

    day: WeekDay
    closed: bool
    opening_hours: List[Tuple[int, int]]

    @staticmethod
    def build(element: ET.Element):
        """Build an OpeningDay from an XML element"""
        closed = element.get("ferme", 0) == 1
        day = int(element.get("id"))
        opening_hours = []
        for hours in element:
            assert hours.tag == "horaire"
            start_hour = (hour(hours.get("ouverture")),)
            end_hour = hour(hours.get("fermeture"))
            opening_hours.append((start_hour, end_hour))
        return WorkDay(day, closed, opening_hours)


def hour(text: str) -> int:
    """
    Parse an hour with format "hh.mm" into an integer
    :param text: Hour text, like hh.mm
    :return: Hour value, in minutes (i.e. 60*h+m)
    """
    hours, minutes = text.split(".")
    return int(hours) * 60 + int(minutes)


def parse_services(services: ET.Element) -> Set[str]:
    """
    Parse <services> tag.
    :param services: The element services
    :return: The list of services parsed
    """
    return {service.text for service in services}


def parse_work_days(element: ET.Element) -> List[WorkDay]:
    """
    Parse <horaires> tag.
    :param element: The element horaires
    :return: List of work days
    """
    return [WorkDay.build(child) for child in element]


def parse_iso_datetime(date_str: str) -> datetime:
    """Parse an ISO datetime, handling without T"""
    if "T" in date_str:
        return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")
    return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")


def parse_price(element: ET.Element) -> Tuple[FuelType, datetime, float]:
    """
    Parse <prix> tag.
    :param element: The element <prix> to parse
    :return: fuel type, update date, price
    """
    return (
        FuelType[element.get("nom").upper()],
        parse_iso_datetime(element.get("maj")),
        float(element.get("valeur")),
    )


@dataclass
class SalePoint:  # pylint: disable=too-many-instance-attributes
    """Sale point of fuel"""

    id: str
    location: Location
    address: Address
    prices: Dict[FuelType, List[Tuple[datetime, float]]]
    out_of_orders: List[OutOfOrder]
    closing_times: List[ClosingTime]
    services: Optional[Set[str]] = None
    automate_24h: bool = False
    opening_days: Optional[List[WorkDay]] = None

    @staticmethod
    def build(element: ET.Element):
        """Build a SalePoint from an XML element"""
        prices = {key.value: [] for key in FuelType}
        services = None
        automate_24h = False
        opening_days = None
        out_of_orders = []
        closing_times = []
        for child in element:
            if child.tag == "adresse":
                address = child.text
            elif child.tag == "ville":
                city = child.text
            elif child.tag == "prix":
                if len(child.attrib) > 0:
                    fuel_type, date, price = parse_price(child)
                    prices[fuel_type.value].append((date, price))
            elif child.tag == "services":
                services = parse_services(child)
            elif child.tag == "horaires":
                automate_24h = child.get("automate-24-24", 0) == 1
                opening_days = parse_work_days(child)
            elif child.tag == "rupture":
                if len(child.attrib) > 0:
                    out_of_orders.append(OutOfOrder.build(child))
            elif child.tag == "fermeture":
                if len(child.attrib) > 0:
                    closing_times.append(ClosingTime.build(child))
            else:
                raise Exception("Unhandled tag " + child.tag + " in " + child)
        return SalePoint(
            id=element.get("id"),
            location=Location(element.get("latitude"), element.get("longitude")),
            address=Address(element.get("cp"), address, city),
            prices=prices,
            out_of_orders=out_of_orders,
            closing_times=closing_times,
            services=services,
            automate_24h=automate_24h,
            opening_days=opening_days,
        )
