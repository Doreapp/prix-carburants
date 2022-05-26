"""
Main entrypoint
"""

import argparse
import sys
from typing import List

from .fetch import DataFechter
from .parse import build_sale_points


def build_cli_parser() -> argparse.ArgumentParser:
    """Build and return Command Line Interface parser"""
    parser = argparse.ArgumentParser(
        "prixcarburants",
        description="Program to fetch french fuel prices",
        epilog="Built by Antoine MANDIN",
    )
    parser.add_argument("type", help="Type of data to download", choices=("instantaneous", "year"))
    return parser


def main(cli: List[str]):
    """
    Main entrypoint
    :param cli: Command line arguments
    """
    parser = build_cli_parser()
    arguments = parser.parse_args(cli)
    if arguments.type == "instantaneous":
        DataFechter().download_instantaneous_data()
        sale_points = build_sale_points(".tmp/PrixCarburants_instantane.xml")
        print(f"Found {len(sale_points)} sale points")
    elif arguments.type == "year":
        DataFechter().download_year_data()


if __name__ == "__main__":
    main(sys.argv[1:])
