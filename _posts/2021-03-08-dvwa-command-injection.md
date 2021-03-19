---
layout: post
title: DVWA之命令行注入
date: '2021-03-08 18:38:20 +0800'
categories: technology
tags: ubuntu apache mysql php phpmyadmin git hack web dvwa
img: https://i.loli.net/2021/03/19/g9GNdv3kuIRQBzA.png
themecolor: "#fff"
themetextcolor: "#000"
describe: Command Injection in DVWA
---

## 命令行注入

我们平常使用的`windows` 系统是可以调用 `dos` 命令行窗口进行操作，`linux` 系统可以调用 `bash` 命令行工具进行操作。

命令注入，是指由于 Web 应用程序对用户提交的数据过滤不严格，导致黑客可以通过构造特殊命令字符串的方式，将数据提交至 Web 应用程序中，并利用该方式执行外部程序或系统命令实施攻击，非法获取数据或者网络资源等。 在命令注入的漏洞中，最为常见的是 PHP 的命令注入。PHP 命令注入攻击存在的主要原因是 Web 应用程序员在应用 PHP 语言中一些具有命令执行功能的函数时，对用户提交的数据内容没有进行严格的过滤就带入函数中执行而造成的。例如，当黑客提交的数据内容为向网站目录写入 PHP 文件时，就可以通过该命令注入攻击漏洞写入一个 PHP 后门文件，进而实施进一步的渗透攻击。

## 命令行注入的三个条件

1. 调用可执行系统命令的函数（PHP 执行命令的函数：`system`，`exec`，`shell_exec`，`eval`）
2. 参数或函数的参数可控
3. 拼接注入命令

## 命令行注入攻击过程

<img src="/assets/images/posts/dvwa/cmd/cmd-process.png">

## 常用的命令连接符

| Windows命令连接符 | 功能               |
| ----------------- | ------------------ |
| `|`               | 直接执行后面的语句 |
| `||`              | 当前面的语句执行出错时，执行后面的语句，前面的语句只能为假                  |
| `&`               | 如果前面的语句为假则直接执行后面的语句，前面的语句可真可假                   |
| `&&`              | 如果前面的语句为假则直接出错，也不执行后面的，前面的语句只能为真                  |

| Linux命令连接符 | 功能                                   |
| --------------- | -------------------------------------- |
| `;`             | 执行完前面的语句在执行后面的           |
| `|`             | 显示后面语句的执行结果                 |
| `||`            | 当前面的语句执行出错时，执行后面的语句 |
| `&`             | 如果前面的语句为假则直接执行后面的语句，前面的语句可真可假                                       |
| `&&`            | 如果前面的语句为假则直接出错，也不执行后面的，前面的语句只能为真                                      |

## DVWA之low级别
|命令连接符 | 成功截图                                   |
| --------------- | -------------------------------------- |
| `&`             | ![](../assets/images/posts/dvwa/cmd/low-1.png)            |
| `|`             | ![](../assets/images/posts/dvwa/cmd/low-2.png)            |
| `||`             | ![](../assets/images/posts/dvwa/cmd/low-3.png)            |
| `;`             | ![](../assets/images/posts/dvwa/cmd/low-4.png)            |

### 源代码分析

```php
<?php

if( isset( $_POST[ 'Submit' ]  ) ) {
    // Get input
    $target = $_REQUEST[ 'ip' ];

    // Determine OS and execute the ping command.
    if( stristr( php_uname( 's' ), 'Windows NT' ) ) {
        // Windows
        $cmd = shell_exec( 'ping  ' . $target );
    }
    else {
        // *nix
        $cmd = shell_exec( 'ping  -c 4 ' . $target );
    }

    // Feedback for the end user
    echo "<pre>{$cmd}</pre>";
}

?> 
```

low级别的代码使用 `shell_exec` 将用户输入执行 `ping` 命令，基本没有任何防御。

## DVWA之medium级别

|命令连接符 | 成功截图                                   |
| --------------- | -------------------------------------- |
| `|`             | ![](../assets/images/posts/dvwa/cmd/medium-1.png)            |
| `||`             | ![](../assets/images/posts/dvwa/cmd/medium-2.png)>            |
| `&`             | ![](../assets/images/posts/dvwa/cmd/medium-3.png)            |

### 源代码分析

```php
<?php

if( isset( $_POST[ 'Submit' ]  ) ) {
    // Get input
    $target = $_REQUEST[ 'ip' ];

    // Set blacklist
    $substitutions = array(
        '&&' => '',
        ';'  => '',
    );

    // Remove any of the charactars in the array (blacklist).
    $target = str_replace( array_keys( $substitutions ), $substitutions, $target );

    // Determine OS and execute the ping command.
    if( stristr( php_uname( 's' ), 'Windows NT' ) ) {
        // Windows
        $cmd = shell_exec( 'ping  ' . $target );
    }
    else {
        // *nix
        $cmd = shell_exec( 'ping  -c 4 ' . $target );
    }

    // Feedback for the end user
    echo "<pre>{$cmd}</pre>";
}

?> 
```

medium级别使用黑名单机制，替换掉如 `&&` 和 `;`这样的命令符号。但是这样简单的黑名单是很容易绕过的，比如 `|` 管道符就没有屏蔽。



## DVWA之high级别

|命令连接符 | 成功截图                                   |
| --------------- | -------------------------------------- |
| `|`             | ![](../assets/images/posts/dvwa/cmd/high.png)            |

### 源代码分析

```php
<?php

if( isset( $_POST[ 'Submit' ]  ) ) {
    // Get input
    $target = trim($_REQUEST[ 'ip' ]);

    // Set blacklist
    $substitutions = array(
        '&'  => '',
        ';'  => '',
        '| ' => '',
        '-'  => '',
        '$'  => '',
        '('  => '',
        ')'  => '',
        '`'  => '',
        '||' => '',
    );

    // Remove any of the charactars in the array (blacklist).
    $target = str_replace( array_keys( $substitutions ), $substitutions, $target );

    // Determine OS and execute the ping command.
    if( stristr( php_uname( 's' ), 'Windows NT' ) ) {
        // Windows
        $cmd = shell_exec( 'ping  ' . $target );
    }
    else {
        // *nix
        $cmd = shell_exec( 'ping  -c 4 ' . $target );
    }

    // Feedback for the end user
    echo "<pre>{$cmd}</pre>";
}

?> 
```

high级别完善了黑名单机制，筛除了更多字符。
这里的 | 符号后面多了一个空格，现实生活中就相当于程序员小手一抖多了一个空格，也就是多了这一个空格，导致过滤不严格，我们的`|`符号没有被过滤，所以我们可以进行命令注入。

## DVWA之impossible级别

### 源代码分析

```php
<?php

if( isset( $_POST[ 'Submit' ]  ) ) {
    // Check Anti-CSRF token
    checkToken( $_REQUEST[ 'user_token' ], $_SESSION[ 'session_token' ], 'index.php' );

    // Get input
    $target = $_REQUEST[ 'ip' ];
    $target = stripslashes( $target );

    // Split the IP into 4 octects
    $octet = explode( ".", $target );

    // Check IF each octet is an integer
    if( ( is_numeric( $octet[0] ) ) && ( is_numeric( $octet[1] ) ) && ( is_numeric( $octet[2] ) ) && ( is_numeric( $octet[3] ) ) && ( sizeof( $octet ) == 4 ) ) {
        // If all 4 octets are int's put the IP back together.
        $target = $octet[0] . '.' . $octet[1] . '.' . $octet[2] . '.' . $octet[3];

        // Determine OS and execute the ping command.
        if( stristr( php_uname( 's' ), 'Windows NT' ) ) {
            // Windows
            $cmd = shell_exec( 'ping  ' . $target );
        }
        else {
            // *nix
            $cmd = shell_exec( 'ping  -c 4 ' . $target );
        }

        // Feedback for the end user
        echo "<pre>{$cmd}</pre>";
    }
    else {
        // Ops. Let the user name theres a mistake
        echo '<pre>ERROR: You have entered an invalid IP.</pre>';
    }
}

// Generate Anti-CSRF token
generateSessionToken();

?> 
```

impossible级别使用白名单机制替换掉黑名单，将用户输入的字符串重组为数组，依次遍历数组内元素，删除其中所有的非数字和 `.`。这样就达到了防御命令注入的目的。

## 防御命令行注入

1. 尽量不要执行外部命令。
2. 使用自定义函数或者函数库来代替外部命令的功能。
3. 使用 `escapeshe||arg` 函数来处理命令参数。
4. 使用 `safe_mode_exec_dir` 指定可执行文件的路径。（`safe_mode_exec_dir` 指定路径时可以把会使用的命令提前放入此路径内。）
5. 使用白名单和黑名单混合的机制。
6. 在后台对应用的权限进行控制（比如可以给 PHP 建立独立的账户，控制 PHP 的启动权限）