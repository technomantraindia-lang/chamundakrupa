<?php
declare(strict_types=1);

const SITE_NAME = 'Chamunda Krupa Enterprise';
const RECIPIENT_EMAIL = 'info@chamundakrupaenterprise.com';
const RECIPIENT_NAME = 'Chamunda Krupa Enterprise';

function clean_input(?string $value): string
{
    return htmlspecialchars(trim((string) $value), ENT_QUOTES, 'UTF-8');
}

function is_ajax_request(): bool
{
    return strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';
}

function send_json_response(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload);
    exit;
}

function redirect_with_status(string $status): void
{
    header('Location: contact.html?status=' . urlencode($status));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    if (is_ajax_request()) {
        send_json_response(405, [
            'success' => false,
            'message' => 'Invalid request method.'
        ]);
    }

    header('Location: contact.html');
    exit;
}

$name = clean_input($_POST['name'] ?? '');
$phone = preg_replace('/\D+/', '', (string) ($_POST['phone'] ?? '')) ?? '';
$email = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_SANITIZE_EMAIL);
$message = clean_input($_POST['message'] ?? '');
$requestedMaterial = clean_input($_POST['requested_material'] ?? '');
$botcheck = trim((string) ($_POST['botcheck'] ?? ''));

if ($botcheck !== '') {
    if (is_ajax_request()) {
        send_json_response(400, [
            'success' => false,
            'message' => 'Spam check failed.'
        ]);
    }

    redirect_with_status('error');
}

if ($requestedMaterial !== '' && $message === '') {
    $message = 'Requested material: ' . $requestedMaterial;
}

$emailIsValid = $email === '' || filter_var($email, FILTER_VALIDATE_EMAIL);

if ($name === '' || strlen($phone) !== 10 || !$emailIsValid) {
    $errorMessage = 'Please enter a valid name, 10-digit phone number, and optional email address.';

    if (is_ajax_request()) {
        send_json_response(422, [
            'success' => false,
            'message' => $errorMessage
        ]);
    }

    redirect_with_status('error');
}

$subject = SITE_NAME . ' - New Contact Form Inquiry';
$safeName = $name;
$safePhone = clean_input($phone);
$safeEmail = $email !== '' ? clean_input($email) : 'Not provided';
$safeMaterial = $requestedMaterial !== '' ? $requestedMaterial : 'Not specified';
$safeMessage = $message !== '' ? nl2br($message) : 'No additional instructions provided.';

$emailBody = "
<html>
<body style=\"margin:0;padding:24px;background:#f5f5f0;font-family:Arial,sans-serif;color:#172017;\">
  <div style=\"max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d7decf;border-radius:14px;overflow:hidden;\">
    <div style=\"background:#2f6f25;padding:24px 28px;color:#ffffff;\">
      <h1 style=\"margin:0;font-size:24px;\">Chamunda Krupa Enterprise</h1>
      <p style=\"margin:8px 0 0;font-size:14px;opacity:0.92;\">New website contact inquiry received</p>
    </div>
    <div style=\"padding:28px;\">
      <p style=\"margin:0 0 18px;font-size:15px;line-height:1.6;\">A new inquiry has been submitted from the website contact form.</p>
      <table style=\"width:100%;border-collapse:collapse;\">
        <tr>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;width:190px;font-weight:700;\">Name</td>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;\">{$safeName}</td>
        </tr>
        <tr>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;font-weight:700;\">Phone</td>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;\">{$safePhone}</td>
        </tr>
        <tr>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;font-weight:700;\">Email</td>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;\">{$safeEmail}</td>
        </tr>
        <tr>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;font-weight:700;\">Requested Material</td>
          <td style=\"padding:12px 0;border-bottom:1px solid #e7ebdf;\">{$safeMaterial}</td>
        </tr>
      </table>
      <div style=\"margin-top:22px;padding:18px;background:#f8faf4;border-left:4px solid #f0b429;border-radius:8px;\">
        <h2 style=\"margin:0 0 10px;font-size:16px;\">Message</h2>
        <p style=\"margin:0;font-size:15px;line-height:1.7;\">{$safeMessage}</p>
      </div>
    </div>
  </div>
</body>
</html>
";

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . RECIPIENT_NAME . ' <' . RECIPIENT_EMAIL . '>',
];

if ($email !== '') {
    $headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
}

$sent = mail(RECIPIENT_EMAIL, $subject, $emailBody, implode("\r\n", $headers));

if (!$sent) {
    $errorMessage = 'We could not send your inquiry right now. Please email us directly at ' . RECIPIENT_EMAIL . '.';

    if (is_ajax_request()) {
        send_json_response(500, [
            'success' => false,
            'message' => $errorMessage
        ]);
    }

    redirect_with_status('error');
}

if (is_ajax_request()) {
    send_json_response(200, [
        'success' => true,
        'message' => 'Inquiry sent successfully.'
    ]);
}

redirect_with_status('success');
