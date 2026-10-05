<?php
// backend/src/Auth.php
declare(strict_types=1);

namespace App;

use PDO;

class Auth {
    private static string $secretKey = 'radiowave_super_secure_jwt_secret_key_2026_kenya';

    public static function setSecret(string $secret): void {
        self::$secretKey = $secret;
    }

    public static function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }

    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }

    public static function generateToken(array $payload, int $expirySeconds = 86400 * 7): string {
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['exp'] = time() + $expirySeconds;
        $payload['iat'] = time();
        $payloadEncoded = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$header.$payloadEncoded", self::$secretKey, true);
        $signatureEncoded = base64_encode($signature);
        return "$header.$payloadEncoded.$signatureEncoded";
    }

    public static function validateToken(?string $jwt): ?array {
        if (!$jwt) {
            return null;
        }

        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;
        $expectedSig = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secretKey, true));
        if (!hash_equals($expectedSig, $signature)) {
            return null;
        }

        $data = json_decode(base64_decode($payload), true);
        if (!$data || !isset($data['exp']) || $data['exp'] < time()) {
            return null;
        }

        return $data;
    }

    public static function getCurrentUser(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $tokenData = self::validateToken($token);
            if ($tokenData && isset($tokenData['user_id'])) {
                $db = Database::getConnection();
                $stmt = $db->prepare("SELECT id, name, email, phone, role, avatar_url, status FROM users WHERE id = ?");
                $stmt->execute([$tokenData['user_id']]);
                return $stmt->fetch() ?: null;
            }
        }

        return null;
    }

    public static function requireAuth(): array {
        $user = self::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Authentication required. Please login.']);
            exit;
        }
        return $user;
    }

    public static function requireRole(string ...$allowedRoles): array {
        $user = self::requireAuth();
        if (!in_array($user['role'], $allowedRoles, true) && $user['role'] !== 'super_admin') {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Permission denied. Insufficient role permissions.']);
            exit;
        }
        return $user;
    }
}
