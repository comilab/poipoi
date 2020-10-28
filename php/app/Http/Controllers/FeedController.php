<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\Setting;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    protected $setting;

    public function __construct(Setting $setting)
    {
        $this->setting = $setting;
    }

    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function __invoke(Request $request)
    {
        if (!$this->setting->get('enableFeed')) {
            abort(404);
        }

        $posts = Post::with(['user', 'images'])
            ->public()
            ->latest()
            ->limit(20)
            ->get();

        return view('feed', [
            'setting' => $this->setting,
            'posts' => $posts,
        ]);
    }
}
