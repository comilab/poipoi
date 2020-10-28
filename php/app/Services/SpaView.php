<?php

namespace App\Services;

use App\Models\Post;

class SpaView
{
    protected $setting;

    public function __construct(Setting $setting)
    {
        $this->setting = $setting;
    }

    public function render(Post $post = null)
    {
        $html = $this->load();

        if ($post) {
            return $this->compile($html, $this->getHeadersForPost($post));
        }

        return $this->compile($html, $this->getHeaders($post));

    }

    protected function load()
    {
        return file_get_contents(public_path('_nuxt/index.html'));
    }

    protected function getHeaders()
    {
        $headers = [
            'title' => $this->setting->get('siteTitle'),
            'meta' => [
                [
                    'name' => 'description',
                    'content' => $this->setting->get('siteDescription'),
                ],
            ],
            'link' => [],
        ];

        if ($this->setting->get('denyRobot')) {
            $headers['meta'][] = [
                'name' => 'robots',
                'content' => 'noindex, nofollow, noarchive',
            ];
        }

        if ($this->setting->get('enableFeed')) {
            $headers['link'][] = [
                'rel' => 'alternate',
                'type' => 'application/rss+xml',
                'title' => $this->setting->get('siteTitle'),
                'href' => url('/feed'),
            ];
        }

        return $headers;
    }

    protected function getHeadersForPost(Post $post)
    {
        $title = $post->title !== '' ? $post->title : $post->caption;

        $headers = [
            'title' => "{$title} - {$this->setting->get('siteTitle')}",
            'meta' => [
                [
                    'name' => 'description',
                    'content' => $post->caption,
                ],
            ],
            'link' => [],
        ];

        if ($post->actual_deny_robot) {
            $headers['meta'][] = [
                'name' => 'robots',
                'content' => 'noindex, nofollow, noarchive',
            ];
        }

        if ($post->actual_enable_twitter_share) {
            $headers['meta'][] = [
                'property' => 'og:url',
                'content' => $post->url,
            ];
            $headers['meta'][] = [
                'property' => 'og:title',
                'content' => $headers['title'],
            ];
            $headers['meta'][] = [
                'property' => 'og:description',
                'content' => $post->caption,
            ];

            if ($post->images->count() && $post->show_thumbnail) {
                $headers['meta'][] = [
                    'name' => 'twitter:card',
                    'content' => 'summary_large_image',
                ];
                $headers['meta'][] = [
                    'property' => 'og:image',
                    'content' => url($post->images[0]->public_paths['medium']),
                ];
            } else {
                $headers['meta'][] = [
                    'name' => 'twitter:card',
                    'content' => 'summary',
                ];
            }
        }

        return $headers;
    }

    protected function compile(string $html, array $headers)
    {
        $path = preg_replace('/^\//', '', parse_url(env('APP_URL'), PHP_URL_PATH));
        if ($path !== '') {
            $html = str_replace(
                '</head>',
                "<script>window.APP_URL_PATH = '{$path}';</script></head>",
                $html
            );
        }

        if (isset($headers['title'])) {
            $html = preg_replace(
                '/<title>.*?<\/title>/',
                "<title>{$headers['title']}</title>",
                $html
            );
        }

        if (isset($headers['meta'])) {
            foreach ($headers['meta'] as $meta) {
                $html = str_replace(
                    '</head>',
                    "<meta {$this->compileAttrs($meta)}></head>",
                    $html
                );
            }
        }

        if (isset($headers['link'])) {
            foreach ($headers['link'] as $link) {
                $html = str_replace(
                    '</head>',
                    "<link {$this->compileAttrs($link)}></head>",
                    $html
                );
            }
        }

        return $html;
    }

    protected function compileAttrs(array $attributes)
    {
        $attrs = [];
        foreach ($attributes as $key => $value) {
            if ($key === 'name' || $key === 'property') {
                $attrs[] = 'data-hid="'.$value.'"';
            }
            $attrs[] = $key.'="'.$value.'"';
        }
        return implode(' ', $attrs);
    }
}
