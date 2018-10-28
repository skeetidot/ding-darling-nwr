<?php

// This file sets the goProxy function and holds our credentials, hidden two steps away from our HTML document.

session_cache_limiter('nocache');
$cache_limiter = session_cache_limiter();

// Function to run the SQL query in CARTO via PHP proxy, so the CARTO credentials are hidden from the public-facing HTML file
function goProxy($dataURL) 
{
	$baseURL = 'http://lewinkler2.cartodb.com/api/v2/sql?';
	//  					^ CHANGE THE 'CARTODB-USER-NAME' to your cartoDB url!
	$api = '&api_key=ee91882fdd4eddb8534c294750d3c3ac044b0e22';
	//				 ^ENTER YOUR API KEY HERE!
	$url = $baseURL.'q='.urlencode($dataURL).$api;
	$result = file_get_contents ($url);
	return $result;
}
?>