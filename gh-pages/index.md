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

<div id="tester"></div>

<script type="module">
  // constants from site's data
  const metrics = {{ site.data.metrics | jsonify }}
  const fuelNames = {{ site.data.fuel_names | jsonify }}

  import main from "./assets/javascript/index.js"
  main(metrics, fuelNames)
</script>