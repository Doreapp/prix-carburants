"""
Models
"""

import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Dict


@dataclass
class SalePoint:
    """Represent a sale point"""

    id: str
    latitude: float
    longitude: float
    postcode: int
    address: str
    city: str
    prices: Dict[str, dict]

    @staticmethod
    def build(element: ET.Element):
        """Build a SalePoint from an XML element"""
        prices = {}
        for child in element:
            if child.tag == "adresse":
                address = child.text
            elif child.tag == "ville":
                city = child.text
            elif child.tag == "prix":
                name = child.attrib["nom"]
                value = float(child.attrib["valeur"])
                prices[name] = value
        return SalePoint(
            id=element.attrib["id"],
            latitude=element.attrib["latitude"],
            longitude=element.attrib["longitude"],
            postcode=element.attrib["cp"],
            address=address,
            city=city,
            prices=prices,
        )
