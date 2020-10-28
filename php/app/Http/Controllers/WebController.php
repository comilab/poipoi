<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\Setting;
use App\Services\SpaView;
use Illuminate\Http\Request;

class WebController extends Controller
{
    protected $setting;

    protected $view;

    public function __construct(Setting $setting, SpaView $view)
    {
        $this->setting = $setting;
        $this->view = $view;
    }

    public function index()
    {
        return $this->view->render();
    }

    public function showPost(Post $post)
    {
        if (!$post->is_mine && !$post->is_public) {
            abort(404);
        }

        $post->load([
            'images' => function ($query) {
                $query->limit(1);
            },
        ]);

        return $this->view->render($post);
    }

    public function fallback()
    {
        return $this->view->render();
    }
}
