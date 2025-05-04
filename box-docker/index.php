<?php
// Turn on error reporting for debugging (DISABLE in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$output = '';
$error = '';
$ssid = '';  // Keep SSID value for the form input

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	// --- VERY DANGEROUS PART - Handling User Input ---

	if (!isset($_POST['ssid']) || empty(trim($_POST['ssid']))) {
		$error = 'Error: SSID cannot be empty.';
	} else {
		// Get SSID and Password from POST data
		$ssid = $_POST['ssid'];
		$password = isset($_POST['password']) ? $_POST['password'] : '';  // Password might be optional for open networks

		// --- MINIMAL SECURITY: Escape arguments to prevent basic command injection ---
		// --- THIS IS NOT FOOLPROOF and doesn't mitigate all risks! ---
		$escaped_ssid = escapeshellarg($ssid);
		$escaped_password = escapeshellarg($password);

		// --- Construct the command (Example using nmcli) ---
		// Requires NetworkManager tools installed in the container AND
		// sufficient permissions (e.g., via --network=host, dbus mapping, NET_ADMIN caps)
		$command = "nmcli device wifi connect $escaped_ssid password $escaped_password";

		// --- Execute the command ---
		$descriptorSpec = [
			0 => ['pipe', 'r'],  // stdin
			1 => ['pipe', 'w'],  // stdout
			2 => ['pipe', 'w']  // stderr
		];
		$pipes = [];
		$process = proc_open($command, $descriptorSpec, $pipes);

		$stdout = '';
		$stderr = '';
		$exitCode = -1;

		if (is_resource($process)) {
			fclose($pipes[0]);  // Close stdin
			$stdout = stream_get_contents($pipes[1]);
			fclose($pipes[1]);
			$stderr = stream_get_contents($pipes[2]);
			fclose($pipes[2]);
			$exitCode = proc_close($process);

			if ($exitCode === 0) {
				$output = "Successfully executed command.\n\nOutput:\n" . htmlspecialchars($stdout ?: '(No output)');
				// Potential issue: nmcli might return 0 even if connection ultimately fails later.
				// A success here usually means NetworkManager accepted the command.
			} else {
				$error = "Command execution failed (Exit Code: $exitCode).\n\nError Output:\n" . htmlspecialchars($stderr ?: '(No error output)') . "\n\nStandard Output:\n" . htmlspecialchars($stdout ?: '(No standard output)');
			}
		} else {
			$error = 'Error: Failed to execute the system command.';
		}
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
    <div class="container">
        <h1>Connect Server to Wi-Fi Network</h1>

        <div class="warning">
            <strong>🚨 SECURITY WARNING:</strong> This form directly controls the server's network connection. Submitting this form attempts to connect the server (where this page is hosted) to the specified Wi-Fi network. This is extremely dangerous and should NEVER be exposed publicly or used in production environments.
        </div>

        <?php if ($error): ?>
            <div class="error"><?php echo nl2br(htmlspecialchars($error)); ?></div>
        <?php endif; ?>

        <?php if ($output): ?>
            <div class="success">Command Output:</div>
            <pre><?php echo htmlspecialchars($output); ?></pre>
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
</body>
</html>
