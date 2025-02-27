<?php
header('Content-Type: application/json');

// Configurações de e-mail
$to = 'oportunidades@smn.com.br';
$max_file_size = 5 * 1024 * 1024; // 5MB em bytes

// Log para debug - remover em produção ou ajustar para um caminho seguro
$log_enabled = false;
function log_message($message) {
    global $log_enabled;
    if ($log_enabled) {
        file_put_contents('form_log.txt', date('Y-m-d H:i:s') . ' - ' . $message . "\n", FILE_APPEND);
    }
}

log_message('Recebido formulário');

// Validar campos obrigatórios
if (empty($_POST['nome']) || empty($_POST['email']) || empty($_POST['telefone']) || empty($_POST['area']) || empty($_FILES['curriculo'])) {
    log_message('Erro: Campos obrigatórios ausentes');
    http_response_code(400);
    echo json_encode(['error' => 'Todos os campos obrigatórios devem ser preenchidos']);
    exit;
}

// Validar arquivo
$file = $_FILES['curriculo'];
log_message('Verificando arquivo: ' . $file['name'] . ' (' . $file['size'] . ' bytes)');

if ($file['size'] > $max_file_size) {
    log_message('Erro: Arquivo excede tamanho máximo');
    http_response_code(400);
    echo json_encode(['error' => 'O arquivo deve ter no máximo 5MB']);
    exit;
}

if ($file['type'] !== 'application/pdf') {
    log_message('Erro: Arquivo não é PDF - tipo: ' . $file['type']);
    http_response_code(400);
    echo json_encode(['error' => 'O arquivo deve estar no formato PDF']);
    exit;
}

// Preparar o e-mail
$subject = "Novo Currículo Recebido - " . $_POST['nome'];
$message = "Nome: " . $_POST['nome'] . "\n";
$message .= "E-mail: " . $_POST['email'] . "\n";
$message .= "Telefone: " . $_POST['telefone'] . "\n";
$message .= "Área de Interesse: " . $_POST['area'] . "\n";
if (!empty($_POST['mensagem'])) {
    $message .= "Mensagem: " . $_POST['mensagem'] . "\n";
}

// Headers para o e-mail
$boundary = md5(time());
$headers = "From: " . $_POST['email'] . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=" . $boundary . "\r\n";

// Corpo do e-mail
$body = "--" . $boundary . "\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= $message . "\r\n";

// Anexo
$body .= "--" . $boundary . "\r\n";
$body .= "Content-Type: application/pdf; name=\"" . $file['name'] . "\"\r\n";
$body .= "Content-Disposition: attachment; filename=\"" . $file['name'] . "\"\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode(file_get_contents($file['tmp_name']))) . "\r\n";
$body .= "--" . $boundary . "--";

// Enviar e-mail
log_message('Tentando enviar e-mail para ' . $to);

$mail_result = mail($to, $subject, $body, $headers);
log_message('Resultado do envio: ' . ($mail_result ? 'sucesso' : 'falha'));

if ($mail_result) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao enviar o currículo. Por favor, tente novamente.']);
}
