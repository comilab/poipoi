<?php

namespace App\Services;

use \App\Models\Setting as SettingModel;
use Illuminate\Support\Arr;

class Setting
{
    protected $setting;

    protected $fields = [
        'siteTitle',
        'siteDescription',
        'perPage',
        'denyRobot',
        'enableFeed',
        'postDefault.denyRobotScope',
        'postDefault.enableReaction',
        'postDefault.enableTwitterShare',
        'postDefault.allowedEmojis',
        'postDefault.deniedEmojis',
    ];

    public function __construct()
    {
        $this->setting = SettingModel::first();
    }

    public function all()
    {
        return data_get($this->setting, 'data', []);
    }

    public function get($key = null, $default = null)
    {
        return Arr::get($this->all(), $key, $default);
    }

    public function set($key, $value, $save = true)
    {
        $data = $this->all();

        if (Arr::has($data, $key)) {
            Arr::set($data, $key, $value);
        }

        $this->setting->data = $data;

        if ($save) {
            $this->save();
        }
    }

    public function replace($values, $save = true)
    {
        foreach ($this->fields as $field) {
            if (Arr::has($values, $field)) {
                $this->set($field, Arr::get($values, $field), false);
            }
        }

        if ($save) {
            $this->save();
        }
    }

    public function save()
    {
        $this->setting->save();
        $this->refresh();
    }

    public function refresh()
    {
        $this->setting->refresh();
    }

    public function fake($values = [])
    {
        $this->setting = SettingModel::factory()->make();
        $this->replace($values, false);

        return $this;
    }
}
