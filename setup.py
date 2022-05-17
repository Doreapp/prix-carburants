"""Setup the module"""

from setuptools import setup

with open("README.md", "r") as f:
    long_description = f.read()

with open("requirements.txt", "r") as f:
    requirements = f.read().splitlines()

setup(
    name="prixcarburant",
    version="0.0.1",
    description="Fetch of french fuel prices",
    license="MIT",
    long_description=long_description,
    author="Antoine Mandin",
    author_email="doreapp.contact@gmail.com",
    url="https://github.com/Doreapp/prix-carburants",
    packages=["prixcarburant"],
    install_requires=requirements,
    entry_points={
        "console_scripts": ["prixcarburant=prixcarburant.__main__"],
    },
)
