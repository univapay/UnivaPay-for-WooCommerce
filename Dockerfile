# 6.6.1
FROM wordpress:latest 

RUN apt-get update && \
    apt-get install -y curl && \
    # SVN, necessary to run install-wp-tests.sh
    apt-get install -y --no-install-recommends subversion && \
    # mysql-client
    apt-get install -y default-mysql-client && \
    # WP-CLI
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && \
    chmod +x wp-cli.phar && \
    mv wp-cli.phar /usr/local/bin/wp && \
    # Composer
    curl -sS https://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer && \
    # Node.js and NPM
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    # Clean up
    rm -rf /var/lib/apt/lists/*

EXPOSE 80 9000
