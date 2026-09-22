<?php

namespace App\Enums;

enum WorkDailyStatus: string
{
    case Open = 'open';
    case OnProgress = 'on_progress';
    case Selesai = 'selesai';
}
