<?php

namespace App\Exceptions;

use Exception;

class WahaConnectionException extends Exception
{
    public function __construct(
        string $message = 'WAHA API connection failed',
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
