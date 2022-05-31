# Prix carburants

A website to display statistics and information about french fuel prices.

{% for price in site.data.metrics.averages %}
{% assign type_index = price[0] %}
  <li>
      {{ site.data.fuel_names[type_index] }}:
      {{ price[1] }}
  </li>
{% endfor %}
