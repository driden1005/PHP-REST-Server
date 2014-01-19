<?php

$r = Util::getInstance();
$app = \Slim\Slim::getInstance();
use RedBean_Facade as R;

$r->registerHook('manage', 'packages', 'afterGet', function($data){
	if(!$_SESSION['authenticated'])
		return false;
	return $data;
});

$r->registerHook('manage', 'packages', 'beforeInsert', function($data) {
	if(!$_SESSION['authenticated'])
		return false;
	$existing = R::findOne('managepackages','name = ?', array($data['name']));
	if($existing) {
		return false;
	}
	if(isset($data['hook'])) {
		try {
			include_once('lint.php');
			var_dump(\Lint\Lint::checkSourceCode($data['hook'], false));
		} catch (Exception $e) {
			$data['hook'] = null;
		}
	}
	if(isset($data['hook'])) {
		try {
			include_once('lint.php');
			var_dump(\Lint\Lint::checkSourceCode($data['hook'], false));
		} catch (Exception $e) {
			$data['hook'] = null;
		}
	}
	return $data;
});

$r->registerHook('manage', 'packages', 'beforeUpdate', function($newData, $currentData) {
	if(!$_SESSION['authenticated'])
		return false;
	if(isset($newData['hook'])) {
		try {
			include_once('lint.php');
			var_dump(\Lint\Lint::checkSourceCode($newData['hook'], false));
		} catch (Exception $e) {
			$newData['hook'] = $currentData['hook'];
		}
	}
	if(isset($newData['routes'])) {
		try {
			include_once('lint.php');
			var_dump(\Lint\Lint::checkSourceCode($newData['routes'], false));
		} catch (Exception $e) {
			$newData['routes'] = $currentData['routes'];
		}
	}
	return $newData;
});

$r->registerHook('manage', 'packages', 'afterInsert', function($data) {
	if($data['name']) {
		$hookFileName = 'hooks' . DIRECTORY_SEPARATOR . $data['name'] . '.php';
		if(!file_exists($hookFileName)) {
			touch($hookFileName);
		}
		$routeFileName = 'routes' . DIRECTORY_SEPARATOR . $data['name'] . '.php';
		if(!file_exists($routeFileName)) {
			touch($routeFileName);
		}
		if(isset($data['hook']))
			file_put_contents($hookFileName, $data['hook']);
		if(isset($data['routes']))
			file_put_contents($hookFileName, $data['routes']);
	}
});

$r->registerHook('manage', 'packages', 'afterUpdate', function($data) {
	if($data['name']) {
		$hookFileName = 'hooks' . DIRECTORY_SEPARATOR . $data['name'] . '.php';
		if(!file_exists($hookFileName)) {
			touch($hookFileName);
		}
		$routeFileName = 'routes' . DIRECTORY_SEPARATOR . $data['name'] . '.php';
		if(!file_exists($routeFileName)) {
			touch($routeFileName);
		}
		if(isset($data['hook']))
			file_put_contents($hookFileName, $data['hook']);
		if(isset($data['routes']))
			file_put_contents($hookFileName, $data['routes']);
	}
});

$r->registerHook('manage', 'packages', 'beforeRemove', function($data){
	if(!$_SESSION['authenticated'])
		return false;
});

$r->registerHook('manage', 'packages', 'afterRemove', function($data) {

	$package = $data['name'];

	/* remove hooks */

	$hookFileName = 'hooks' . DIRECTORY_SEPARATOR . $package . '.php';
	if(file_exists($hookFileName)) {
		unlink($hookFileName);
	}
	$routeFileName = 'routes' . DIRECTORY_SEPARATOR . $data['name'] . '.php';
	if(file_exists($routeFileName)) {
		unlink($hookFileName);
	}

	/* remove tables */

	$allTables = R::inspect();
	$tableList = array_filter($allTables, function($table) use ($package){
		return substr($table,0,strlen($package)) == $package;
	});

	foreach ($tableList as $table) {
		R::$f->begin()
			->drop_table($table)
			->get();
	}

});
