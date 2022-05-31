# Prix carburants

Voici des statistiques à propos des carburants, en France.

## Prix moyens

Les prix moyens, par carburants, dans l'ensemble de la France :

<table id="averages">
  <tr>
    <th>Carburant</th>
    <th>Prix</th>
  </tr>
</table>

<script type="module">
  import utils from "./assets/javascript/utils.js";
  const metrics = {{ site.data.metrics | jsonify }}
  const fuelNames = {{ site.data.fuel_names | jsonify }}

  let averages = utils.mapPricesToNames(metrics.averages, fuelNames)
  averages = averages.sort((obj1, obj2) => obj2.price - obj1.price)
  utils.populateTable(
    "table#averages",
    averages.map(value => [value.name, value.price.toFixed(2) + " €"])
  )
</script>