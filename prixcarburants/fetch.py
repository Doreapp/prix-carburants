"""
Module containing utilities to fetch information from
https://www.prix-carburants.gouv.fr/rubrique/opendata/ data
"""

import io
import os
import zipfile

import requests

INSTANTANEOUS_URL = "https://donnees.roulez-eco.fr/opendata/instantane"
DAY_URL = "https://donnees.roulez-eco.fr/opendata/jour"
YEAR_URL = "https://donnees.roulez-eco.fr/opendata/annee"


def download_zip(url, output_directory="tmp"):
    """
    Download a ZIP from ``url`` and extract it in ``output_directory``
    """
    response = requests.get(url)
    with io.BytesIO(response.content) as stream, zipfile.ZipFile(stream) as zip_file:
        zip_file.extractall(output_directory)


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
        Download newest data
        Uses INSTANTANEOUS_URL
        """
        download_zip(INSTANTANEOUS_URL, self.output_directory)

    def download_year_data(self):
        """
        Download latest year data
        Uses YEAR_URL
        """
        download_zip(YEAR_URL, self.output_directory)

    def download_day_data(self):
        """
        Download latest day data
        Uses DAY_URL
        """
        download_zip(DAY_URL, self.output_directory)
