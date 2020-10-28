<?php

session_start();

require __DIR__.'/../vendor/autoload.php';

$artisanPath = __DIR__ . '/../artisan';

$errors = [];
$installed = false;

function install (array $input) {
    global $artisanPath;

    $logs = [];

    $logs[] = makeLog('アプリキーの生成');
    exec("php {$artisanPath} key:generate --env=production", $output, $returnVar);
    if ($returnVar === 0) {
        $logs[] = makeLog('...成功', 'success');
    } else {
        $logs[] = makeLog('...失敗', 'danger');
        return ['result' => false, 'logs' => $logs, 'output' => $output];
    }

    $logs[] = makeLog('ストレージフォルダの設定');
    exec("php {$artisanPath} storage:link --env=production", $output, $returnVar);
    if ($returnVar === 0) {
        $logs[] = makeLog('...成功', 'success');
    } else {
        $logs[] = makeLog('...失敗', 'danger');
        return ['result' => false, 'logs' => $logs, 'output' => $output];
    }

    $logs[] = makeLog('データベースの初期化');
    exec("php {$artisanPath} migrate --env=production --force", $output, $returnVar);
    if ($returnVar === 0) {
        $logs[] = makeLog('...成功', 'success');
    } else {
        $logs[] = makeLog('...失敗', 'danger');
        return ['result' => false, 'logs' => $logs, 'output' => $output];
    }

    $logs[] = makeLog('初期データ作成');
    exec(
        "php {$artisanPath} poipoi:init-data --env=production --name={$input['name']} --email={$input['email']} --password={$input['password']}",
        $output,
        $returnVar
    );
    if ($returnVar === 0) {
        $logs[] = makeLog('...成功', 'success');
    } else {
        $logs[] = makeLog('...失敗', 'danger');
        return ['result' => false, 'logs' => $logs, 'output' => $output];
    }

    return ['result' => true, 'logs' => $logs, 'output' => []];
}

function makeLog ($log, $color = 'body') {
    return "<span class='text-{$color}'>{$log}</span>";
}

$count = exec("php {$artisanPath} poipoi:init-data --env=production --check");
if ($count !== '0') {
    $installed = true;
} else {
    $tokenMatched = !empty($_SESSION['token']) && $_SESSION['token'] === $_POST['token'];
    if ($_POST['mode'] === 'install' && $tokenMatched) {
        $name = (string) filter_input(INPUT_POST, 'name');
        $email = (string) filter_input(INPUT_POST, 'email');
        $password = (string) filter_input(INPUT_POST, 'password');

        if ($name === '') {
            $errors['name'] = 'ユーザー名を入力してください';
        }
        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'メールアドレスを入力してください';
        }
        if ($password === '') {
            $errors['password'] = 'パスワードを入力してください';
        }

        if (!count($errors)) {
            $installResult = install([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);
        }
    }

    $newToken = md5(time().rand());
    $_SESSION['token'] = $newToken;
}
?>
<!DOCTYPE html>
<html lang="ja">
    <head>
        <title>インストール - poipoi</title>
        <link rel="stylesheet" href="//stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
        <script src="//stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
    </head>
    <body>
        <div class="container my-5 mx-auto">
            <?php if ($installed): ?>
                <p>インストールは既に完了しています。<br>作成したユーザーアカウントでログインしてください。</p>
                <p><strong class="text-danger">セキュリティの関係上、インストール完了後はこのファイル（public/install.php）を削除することをお勧めします。</p>
            <?php elseif ($_POST['mode'] !== 'install' || count($errors) || !$tokenMatched): ?>
                <h4>インストール</h4>
                <p>poipoiのインストールを行います。</p>
                <div class="card bg-light my-3">
                    <div class="card-body">
                        <p><strong>事前に以下の作業が完了しているかをご確認ください。</strong></p>
                        <ul>
                            <li class="my-2">ファイル <code>.env.production.example</code> をコピーし、 <code>.env</code> という名前で設置している</li>
                            <li class="my-2">ファイル <code>.env</code> 内の設定 <code>APP_URL</code> を、設置先のURLに変更している</li>
                            <li class="my-2">ファイル <code>.env</code> 内の設定 <code>SANCTUM_STATEFUL_DOMAINS</code> を、設置先のドメインに変更している</li>
                            <li class="my-2"><code>storage</code> 以下の全てのディレクトリ（フォルダ）が書き込み可能になっている<br>
                                ※書き込み可能なパーミッションは、サーバによって異なります。大抵は <code>777</code> ですが、正確な情報はサーバの設定をご確認ください
                            </li>
                            <li class="my-2">空ファイル <code>database/database.sqlite</code> が作成され、書き込み可能になっている<br>
                                ※書き込み可能なパーミッションは、サーバによって異なります。大抵は <code>666</code> ですが、正確な情報はサーバの設定をご確認ください
                            </li>
                        </ul>
                    </div>
                </div>
                <p>完了していたら、次に初期設定を入力してください。</p>
                <form method="post">
                    <input type="hidden" name="mode" value="install">
                    <input type="hidden" name="token" value="<?php echo $newToken ?>">
                    <div class="form-group">
                        <label for="name">ユーザー名</label>
                        <input id="name" type="text" name="name" value="<?php echo $name ?>" class="form-control" required />
                    </div>
                    <div class="form-group">
                        <label for="email">メールアドレス</label>
                        <input id="email" type="email" name="email" class="form-control" required />
                        <small class="form-text text-muted">ログインのみに使用します。</small>
                    </div>
                    <div class="form-group">
                        <label for="password">パスワード</label>
                        <input id="password" type="password" name="password" class="form-control" required />
                    </div>
                    <button class="btn btn-primary">インストール</button>
                </form>
            <?php else: ?>
                <h4>インストール結果</h4>
                <?php foreach ($installResult['logs'] as $log): ?>
                    <div><?php echo $log ?></div>
                <?php endforeach ?>
                <?php if ($installResult['result']): ?>
                    <p class="mt-5">インストールが無事完了しました。<br>
                    先程設定したメールアドレスとパスワードを使って、アプリにログインしてください。</p>
                    <p><strong class="text-danger">セキュリティの関係上、インストール完了後はこのファイル（public/install.php）を削除することをお勧めします。</p>
                    <p class="mt-5">
                        <a href="./" target="_blank" class="btn btn-primary">アプリを表示する</a>
                    </p>
                <?php else: ?>
                    <p class="mt-5"><span class="text-danger">インストールに失敗しました。</span><br>
                    以下にログを出力します。</p>
                    <pre class="pre-scrollable bg-light border rounded my-3 p-3"><code><?php echo implode("\n", $installResult['output']) ?><code></pre>
                    <p class="mt-5">
                        <a href="./install.php" class="btn btn-primary">戻る</a>
                    </p>
                <?php endif ?>
            <?php endif ?>
        </div>
    </body>
</html>
