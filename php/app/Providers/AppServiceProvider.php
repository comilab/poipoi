<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(\Illuminate\Pagination\LengthAwarePaginator::class, \App\Services\LengthAwarePaginator::class);
        $this->app->singleton(\App\Services\Setting::class);
        $this->app->singleton(\App\Services\Emoji::class);
        $this->app->bind(\App\Services\SpaView::class);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        JsonResource::withoutWrapping();
    }
}
