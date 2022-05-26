"""
Module containing utilities to fetch information from
https://www.prix-carburants.gouv.fr/rubrique/opendata/ data
"""

import io
import os
import zipfile
from typing import List

import requests

INSTANTANEOUS_URL = "https://donnees.roulez-eco.fr/opendata/instantane"
DAY_URL = "https://donnees.roulez-eco.fr/opendata/jour"
YEAR_URL = "https://donnees.roulez-eco.fr/opendata/annee"


def download_zip(url: str, output_directory: str = "tmp", quiet: bool = False) -> List[str]:
    """
    Download a ZIP from ``url`` and extract it in ``output_directory``
    :param url: Url to download the ZIP from
    :param output_directory: Directory to extract the ZIP file in
    :param quiet: True to prevent printing on the console
    :return: Names of the files extracted in ``output_directory``
    """
    if not quiet:
        print(f"Downloading in {output_directory} directory...")
    response = requests.get(url)
    with io.BytesIO(response.content) as stream, zipfile.ZipFile(stream) as zip_file:
        names = zip_file.namelist()
        zip_file.extractall(output_directory)
    if not quiet:
        print(f"Downloaded as: {', '.join(names)}")
    return names


class DataFechter:
    """Fetcher of fuel prices"""

    def __init__(self, output_directory=".tmp"):
        """
        :param output_directory: Direcotry to save data in
        """
        self.output_directory = output_directory
        os.makedirs(self.output_directory, exist_ok=True)

    def download_instantaneous_data(self):
        """
        Download newest data available. Uses INSTANTANEOUS_URL.
        :return: Paths to the files downloaded
        """
        filenames = download_zip(INSTANTANEOUS_URL, self.output_directory)
        return map(lambda name: os.path.join(self.output_directory, name), filenames)

    def download_year_data(self):
        """
        Download current year's data. Uses YEAR_URL.
        :return: Paths to the files downloaded
        """
        filenames = download_zip(YEAR_URL, self.output_directory)
        return map(lambda name: os.path.join(self.output_directory, name), filenames)

    def download_day_data(self):
        """
        Download today's data. Uses DAY_URL.
        :return: Paths to the files downloaded
        """
        filenames = download_zip(DAY_URL, self.output_directory)
        return map(lambda name: os.path.join(self.output_directory, name), filenames)
