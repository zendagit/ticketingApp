<?php

namespace App\Helpers;

class PasswordHelper
{
    // You can tune these if needed
    private static $algo = 'sha256';
    private static $iterations = 100000;
    private static $saltBytes = 16;

    public static function hashPassword($password)
    {
        $iterations = self::$iterations;
        $salt = bin2hex(random_bytes(self::$saltBytes));

        // Generate PBKDF2 hash
        $hash = hash_pbkdf2(self::$algo, $password, $salt, $iterations, 64);

        // Store in format: iterations$salt$hash
        return "{$iterations}\${$salt}\${$hash}";
    }

    public static function verifyPassword($password, $stored)
    {
        $parts = explode('$', $stored);

        if (count($parts) !== 3) {
            return false;
        }

        [$iterations, $salt, $hash] = $parts;
        $computed = hash_pbkdf2(self::$algo, $password, $salt, (int)$iterations, 64);

        return hash_equals($hash, $computed);
    }
}
