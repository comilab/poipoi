<?php

use App\Http\Controllers\ImageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostReactionController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('posts/{post}/verify', [PostController::class, 'verify']);
Route::apiResource('posts', PostController::class);
Route::apiResource('posts.reactions', PostReactionController::class, ['only' => ['index', 'store', 'destroy']]);
Route::apiResource('images', ImageController::class, ['only' => ['store']]);
Route::apiResource('settings', SettingController::class, ['only' => ['index', 'store']]);
Route::apiResource('notifications', NotificationController::class, ['only' => ['index']]);
Route::apiResource('sessions', SessionController::class, ['only' => ['index', 'store', 'destroy']]);
