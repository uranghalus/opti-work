<?php

namespace App\Services;

use Carbon\Carbon;

class BusinessDayCalculator
{
    public function calculateDeadline(\DateTime $startDate, int $businessDays): \DateTime
    {
        return self::addBusinessDays($startDate, $businessDays);
    }

    public function daysElapsedSince(\DateTimeInterface $since): int
    {
        return self::businessDaysBetween($since, now());
    }

    /**
     * Calculate deadline date by adding business days to a start date.
     * Skips weekends (Saturday/Sunday) and configurable holidays.
     */
    public static function addBusinessDays(\DateTimeInterface $startDate, int $businessDays): Carbon
    {
        $date = Carbon::instance($startDate)->startOfDay();
        $added = 0;

        while ($added < $businessDays) {
            $date->addDay();

            if ($date->isWeekend()) {
                continue;
            }

            if (self::isHoliday($date)) {
                continue;
            }

            $added++;
        }

        return $date;
    }

    /**
     * Calculate elapsed business days between two dates.
     */
    public static function businessDaysBetween(\DateTimeInterface $startDate, \DateTimeInterface $endDate): int
    {
        $start = Carbon::instance($startDate)->startOfDay();
        $end = Carbon::instance($endDate)->startOfDay();
        $days = 0;

        while ($start->lessThan($end)) {
            $start->addDay();

            if ($start->isWeekend()) {
                continue;
            }

            if (self::isHoliday($start)) {
                continue;
            }

            $days++;
        }

        return $days;
    }

    /**
     * Check if a given date is a holiday.
     * Holiday list can be configured via config/holidays.php.
     */
    public static function isHoliday(\DateTimeInterface $date): bool
    {
        $holidays = config('holidays.list', []);
        $dateStr = $date->format('Y-m-d');

        return in_array($dateStr, $holidays);
    }
}
