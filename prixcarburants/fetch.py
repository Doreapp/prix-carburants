"""
Module containing utilities to fetch information from
https://www.prix-carburants.gouv.fr/rubrique/opendata/ data
"""

import io
import logging
import os
import zipfile
from typing import List

import requests

INSTANTANEOUS_URL = "https://donnees.roulez-eco.fr/opendata/instantane"
DAY_URL = "https://donnees.roulez-eco.fr/opendata/jour"
YEAR_URL = "https://donnees.roulez-eco.fr/opendata/annee"

LOGGER = logging.getLogger(os.path.basename(__file__))


def download_zip(url: str, output_directory: str = "tmp") -> List[str]:
    """
    Download a ZIP from ``url`` and extract it in ``output_directory``
    :param url: Url to download the ZIP from
    :param output_directory: Directory to extract the ZIP file in
    :return: Names of the files extracted in ``output_directory``
    """
    LOGGER.debug("Download ZIP from %s into %s", url, output_directory)
    LOGGER.info("Downloading in %s directory...", output_directory)
    response = requests.get(url)
    with io.BytesIO(response.content) as stream, zipfile.ZipFile(stream) as zip_file:
        names = zip_file.namelist()
        zip_file.extractall(output_directory)
    LOGGER.info("Downloaded as: %s", ", ".join(names))
    return names


class DataFechter:
    """Fetcher of fuel prices"""

    def __init__(self, output_directory=".tmp"):
        """
        :param output_directory: Direcotry to save data in
        """
        self.output_directory = output_directory
        os.makedirs(self.output_directory, exist_ok=True)

    def download_instantaneous_data(self) -> str:
        """
        Download newest data available. Uses INSTANTANEOUS_URL.
        :return: Path to the file downloaded
        """
        filenames = download_zip(INSTANTANEOUS_URL, self.output_directory)
        assert len(filenames) == 1
        return os.path.join(self.output_directory, filenames[0])

    def download_year_data(self) -> str:
        """
        Download current year's data. Uses YEAR_URL.
        :return: Path to the file downloaded
        """
        filenames = download_zip(YEAR_URL, self.output_directory)
        assert len(filenames) == 1
        return os.path.join(self.output_directory, filenames[0])

    def download_day_data(self) -> str:
        """
        Download today's data. Uses DAY_URL.
        :return: Path to the file downloaded
        """
        filenames = download_zip(DAY_URL, self.output_directory)
        assert len(filenames) == 1
        return os.path.join(self.output_directory, filenames[0])
