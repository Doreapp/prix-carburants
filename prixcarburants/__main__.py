"""
Main entrypoint
"""

import argparse
import logging
import os
from typing import List, Optional

from . import parse
from .fetch import DataFechter

LOGGER = logging.getLogger(os.path.basename(__file__))


def dir_path(path: str) -> str:
    """
    Ensure ``path`` points nothing or a directory.
    Raise an exception otherwise.
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
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    subparsers = parser.add_subparsers(
        title="command", description="Program command", dest="command"
    )
    download_subparser = subparsers.add_parser(
        "download",
        help="Download data from french Open Data",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    download_subparser.add_argument(
        "type",
        help="Type of data to download. "
        "[now]: most recent data, "
        "[day]: today's data, "
        "[year]: current year's data.",
        choices=("now", "day", "year"),
    )
    download_subparser.add_argument(
        "-o",
        "--output",
        help="Path to the output directory to save the data in",
        type=dir_path,
        default=".tmp",
    )
    transform_subparser = subparsers.add_parser(
        "transform",
        help="Transform data from raw XML to JSON",
    )
    transform_subparser.add_argument(
        "file",
        help="XML file to parse and transform",
    )
    transform_subparser.add_argument(
        "-o",
        "--output",
        help="output file to save the data in. "
        "Default will save the data in the same directory as the input file, "
        "with the same name but as a JSON file.",
        default=None,
    )
    transform_subparser.add_argument(
        "-l",
        "--latest",
        help="degrade saved data to latest. Only save meaningful data about current state",
        action="store_true",
    )
    transform_subparser.add_argument(
        "-m",
        "--metrics",
        help="build metrics from transformed data",
        action="store_true",
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
        LOGGER.debug("'download' command")
        data_fetcher = DataFechter(arguments.output)
        functions = {
            "now": data_fetcher.download_instantaneous_data,
            "day": data_fetcher.download_day_data,
            "year": data_fetcher.download_year_data,
        }
        result = functions[arguments.type]()
        print(result)
    elif arguments.command == "transform":
        sale_points = parse.build_sale_points(arguments.file)
        output = arguments.output
        if output is None:
            directory = os.path.dirname(arguments.file)
            filename = os.path.splitext(os.path.basename(arguments.file))[0]
            output = os.path.join(directory, filename + ".json")
        else:
            directory = os.path.dirname(output)
        if arguments.latest:
            sale_points = parse.degrade_to_latest(sale_points)
        if arguments.metrics:
            metrics = parse.build_metrics(sale_points)
            parse.save_as_json(metrics, os.path.join(directory, "metrics.json"))
        parse.save_as_json(sale_points, output)
        print(output)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
