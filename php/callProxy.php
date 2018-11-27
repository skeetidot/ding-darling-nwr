<?php

// This file calls the proxy, sets the query we pass to it equal to a variable, then runs a function named goProxy using the query as an argument.

// Call the proxy
include 'https://skeetidot.github.io/ding-darling-nwr/php/cartoDBProxy.php';
//			^CHANGE THIS TO THE PATH TO YOUR cartodbProxy.php

// Set the query we pass to the proxy to the $queryURL variable
$queryURL = $_POST['qurl'];

// Run the goProxy function to run the query using the proxy
$return = goProxy($queryURL);
echo $return;
?>