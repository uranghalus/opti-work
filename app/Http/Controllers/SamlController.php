<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Socialite;

class SamlController extends Controller
{
    //
    public function redirect()
    {
        $redirectUrl = config('services.saml.sp_acs');
        // Redirect ke SSO menggunakan Socialite
        return Socialite::driver('saml2')->redirect();
    }
}
