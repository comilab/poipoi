<?php

use App\Http\Controllers\FeedController;
use App\Http\Controllers\WebController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('posts/{post}', [WebController::class, 'showPost']);
Route::get('feed', FeedController::class);
Route::get('/', [WebController::class, 'index']);
Route::fallback([WebController::class, 'fallback']);
