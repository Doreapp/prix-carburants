"""
Main entrypoint
"""

import sys
from typing import List


def main(cli: List[str]):
    """
    Main entrypoint
    :param cli: Command line arguments
    """
    print(cli)


if __name__ == "__main__":
    main(sys.argv[1:])
