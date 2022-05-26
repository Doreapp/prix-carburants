"""
Main entrypoint
"""

import argparse
import os
from typing import List, Optional

from .fetch import DataFechter


def dir_path(path: str) -> str:
    """
    Ensure ``path`` points nothing or a directory.
    Raise an exception else.
    :return: given path
    """
    if os.path.isdir(path) or not os.path.exists(path):
        return path
    raise NotADirectoryError(path)


def build_cli_parser() -> argparse.ArgumentParser:
    """Build and return Command Line Interface parser"""
    parser = argparse.ArgumentParser(
        "prixcarburants",
        description="Program to fetch french fuel prices",
        epilog="Built by Antoine MANDIN",
    )
    subparsers = parser.add_subparsers(
        title="command", description="Program command", dest="command"
    )
    download_subparser = subparsers.add_parser(
        "download", help="Download data from french Open Data"
    )
    download_subparser.add_argument(
        "type",
        help="Type of data to download. "
        "[instantaneous]: most recent data, "
        "[day]: today's data, "
        "[year]: current year's data.",
        choices=("instantaneous", "day", "year"),
    )
    download_subparser.add_argument(
        "-o",
        "--output",
        help="Path to the output directory to save the data in",
        type=dir_path,
        default=".tmp",
    )
    return parser


def main(cli: Optional[List[str]] = None):
    """
    Main entrypoint
    :param cli: Command line arguments
    """
    parser = build_cli_parser()
    arguments = parser.parse_args(cli)
    if arguments.command == "download":
        data_fetcher = DataFechter(arguments.output)
        functions = {
            "instantaneous": data_fetcher.download_instantaneous_data,
            "day": data_fetcher.download_day_data,
            "year": data_fetcher.download_year_data,
        }
        functions[arguments.type]()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
