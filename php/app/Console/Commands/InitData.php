<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InitData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'poipoi:init-data {--name=} {--email=} {--password=} {--check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Make the first user';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        if ($this->option('check')) {
            try {
                $usersCount = User::count();
                echo $usersCount;
            } catch (\Exception $e) {
                echo '0';
            }
            return 0;
        }

        if (User::count() > 0) {
            echo '既にユーザーが存在しています';
            return 1;
        }

        if ($this->option('name') === null) {
            echo 'nameパラメータが不足しています';
            return 1;
        }
        if ($this->option('email') === null) {
            echo 'emailパラメータが不足しています';
            return 1;
        }
        if ($this->option('password') === null) {
            echo 'passwordパラメータが不足しています';
            return 1;
        }

        DB::transaction(function () {
            $user = new User();
            $user->name = $this->option('name');
            $user->email = $this->option('email');
            $user->password = Hash::make($this->option('password'));
            $user->email_verified_at = now();
            $user->remember_token = Str::random(10);
            $user->save();

            $setting = new Setting();
            $setting->data = [
                'siteTitle' => 'poipoi',
                'siteDescription' => '',
                'perPage' => 24,
                'denyRobot' => false,
                'enableFeed' => true,
                'postDefault' => [
                    'denyRobotScope' => ['password', 'nsfw', 'r18'],
                    'enableReaction' => true,
                    'enableTwitterShare' => true,
                    'allowedEmojis' => [],
                    'deniedEmojis' => [],
                ],
            ];
            $setting->save();
        });

        return 0;
    }
}
