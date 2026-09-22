<?php

use App\Providers\AppServiceProvider;
use App\Providers\BroadcastServiceProvider;
use App\Providers\FortifyServiceProvider;
use SocialiteProviders\Manager\ServiceProvider;

return [
    AppServiceProvider::class,
    BroadcastServiceProvider::class,
    FortifyServiceProvider::class,
    ServiceProvider::class,
];
