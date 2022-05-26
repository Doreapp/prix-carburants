"""
Main entrypoint
"""

import argparse
from typing import List, Optional

from .fetch import DataFechter
from .parse import build_sale_points


def build_cli_parser() -> argparse.ArgumentParser:
    """Build and return Command Line Interface parser"""
    parser = argparse.ArgumentParser(
        "prixcarburants",
        description="Program to fetch french fuel prices",
        epilog="Built by Antoine MANDIN",
    )
    parser.add_argument(
        "type", help="Type of data to download", choices=("instantaneous", "day", "year")
    )
    return parser


def main(cli: Optional[List[str]] = None):
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
    elif arguments.type == "day":
        DataFechter().download_day_data()
    elif arguments.type == "year":
        DataFechter().download_year_data()


if __name__ == "__main__":
    main()
