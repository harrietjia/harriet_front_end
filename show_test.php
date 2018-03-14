<?php
	require 'config.php';

	$query = mysql_query("SELECT COUNT(*) AS count,titleid,user,comment,date FROM comment WHERE titleid='{$_POST['titleid']}' ORDER BY date DESC");

	$json = '';

	while (!!$row = mysql_fetch_array($query, MYSQL_ASSOC)) {
		foreach ( $row as $key => $value ) {
			$row[$key] = urlencode(str_replace("\n","", $value));
		}
		$json .= urldecode(json_encode($row)).',';
	}

	echo '['.substr($json, 0, strlen($json) - 1).']';

	mysql_close();
?>
