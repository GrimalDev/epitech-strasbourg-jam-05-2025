<?php
// Turn on error reporting for debugging (DISABLE in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$output = '';
$error = '';
$ssid = '';  // Keep SSID value for the form input
$startingNotice = false;

function commandExec($command)
{
	$output = [false, ''];

	$shell = shell_exec("sudo $command");

	if ($shell !== null && $shell !== false && !str_contains($shell, 'not running') && !str_contains($shell, 'Not connected') && !str_contains($shell, 'not found') && !str_contains($shell, 'Failed') && !str_contains($shell, 'failed')) {
		$output[0] = true;
	}

	$output[1] = $shell;

	return $output;
}

function signalCommand($command)
{
	file_put_contents('/var/www/html/signal.sh', $command);
}

function getSignal()
{
	$signal = file_get_contents('/var/www/html/signal.sh');
	if ($signal === false) {
		return '';
	}
	return $signal;
}

$currentSignal = getSignal();

if (trim($currentSignal) != '') {
	$startingNotice = true;
}

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	if (!isset($_POST['ssid']) || !isset($_POST['password']) || empty(trim($_POST['ssid'])) || empty(trim($_POST['password']))) {
		$error = 'Error: SSID or password cannot be empty.';
	} else {
		// Get SSID and Password from POST data
		$ssid = $_POST['ssid'];
		$password = isset($_POST['password']) ? $_POST['password'] : '';  // Password might be optional for open networks

		// --- MINIMAL SECURITY: Escape arguments to prevent basic command injection ---
		// --- THIS IS NOT FOOLPROOF and doesn't mitigate all risks! ---
		$escaped_ssid = escapeshellarg($ssid);
		$escaped_password = escapeshellarg($password);

		$currentSignal = getSignal();

		if (trim($currentSignal) != '') {
			$startingNotice = true;
		} else {
			signalCommand("/var/www/html/connect-wifi.sh $escaped_ssid $escaped_password");
		}

		/* $outputConnect = commandExec("/var/www/html/connect-wifi.sh $ssid $password"); */
		/* var_dump($outputConnect); */
		/* $error = $outputConnect[0] ? '' : 'Could not connect to the wifi with the given credentials.'; */
		/**/
		/* if ($outputConnect[0]) { */
		/* sleep(3); */
		/* $outputTest = commandExec('/var/www/html/test-wifi-connection.sh'); */
		/* var_dump($outputTest); */
		/* $error = $outputTest[0] ? '' : 'Could not connect to the wifi with the given credentials.'; */
		/* } */
		/* if ($error == '') { */
		/* $startingNotice = true; */
		/* } else { */
		/* commandExec('/var/www/html/start-ap.sh'); */
		/* } */
	}
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connect to Wi-Fi (DANGEROUS)</title>
    <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="password"] {
            width: calc(100% - 22px); /* Adjust width considering padding/border */
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        button { padding: 10px 20px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 3px; }
        button:hover { background-color: #0056b3; }
        pre { background-color: #f4f4f4; padding: 15px; border: 1px solid #ccc; white-space: pre-wrap; word-wrap: break-word; margin-top: 20px; }
        .error { color: red; font-weight: bold; border: 1px solid red; padding: 10px; margin-bottom: 15px; background-color: #ffebeb; }
        .success { color: green; font-weight: bold; border: 1px solid green; padding: 10px; margin-bottom: 15px; background-color: #e6ffec; }
        .warning { color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <?php if ($startingNotice): ?>
    <div class="container">
<h1>Starting Access Point...</h1>
        <div class="success">
            <strong>Success:</strong> Initializing Hacking environment....
        </div>
        <div class="warning">
            <strong>Note:</strong> This page will not automatically refresh because this service and the access point will be sutdown. You may need to check the server's status manually.
        </div>
    </div>
    <?php else: ?>
      <div class="container">
          <h1>Connect Server to Wi-Fi Network</h1>

          <?php if ($error): ?>
              <div class="error"><?php echo nl2br(htmlspecialchars($error)); ?></div>
          <?php endif; ?>

          <form action="index.php" method="POST">
              <div>
                  <label for="ssid">Wi-Fi Network Name (SSID):</label>
                  <input type="text" id="ssid" name="ssid" value="<?php echo htmlspecialchars($ssid); ?>" required>
              </div>
              <div>
                  <label for="password">Password (optional):</label>
                  <input type="password" id="password" name="password">
              </div>
              <div>
                  <button type="submit">Connect to Wi-Fi</button>
              </div>
          </form>
      </div>
    <?php endif; ?>
</body>
</html>
