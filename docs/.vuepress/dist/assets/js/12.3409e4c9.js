(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{187:function(e,t,s){"use strict";s.r(t);var r=s(0),a=Object(r.a)({},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"content"},[e._m(0),e._v(" "),s("BlogPostMeta"),e._v(" "),s("p"),e._m(1),s("p"),e._v(" "),e._m(2),e._v(" "),e._m(3),e._m(4),e._v(" "),e._m(5),e._m(6),e._v(" "),e._m(7),e._m(8),e._v(" "),e._m(9)],1)},[function(){var e=this.$createElement,t=this._self._c||e;return t("h1",{attrs:{id:"redis集群安装"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#redis集群安装","aria-hidden":"true"}},[this._v("#")]),this._v(" Redis集群安装")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"table-of-contents"},[t("ul",[t("li",[t("a",{attrs:{href:"#安装ruby环境"}},[this._v("安装ruby环境")])]),t("li",[t("a",{attrs:{href:"#安装redis"}},[this._v("安装Redis")])]),t("li",[t("a",{attrs:{href:"#启动redis实例"}},[this._v("启动Redis实例")])]),t("li",[t("a",{attrs:{href:"#开启集群"}},[this._v("开启集群")])])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"安装ruby环境"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#安装ruby环境","aria-hidden":"true"}},[this._v("#")]),this._v(" 安装ruby环境")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("yum install curl\ncurl -sSL https://rvm.io/mpapis.asc | gpg --import -\ncurl -L get.rvm.io | bash -s stable\nsource /etc/profile.d/rvm.sh\nrvm reload\nrvm install 2.6.0 --disable-binary\n# 安装redis插件\ngem install redis\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"安装redis"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#安装redis","aria-hidden":"true"}},[this._v("#")]),this._v(" 安装Redis")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("wget http://download.redis.io/releases/redis-4.0.10.tar.gz\ntar -zxvf redis-4.0.10.tar.gz\n# 进入deps里面make环境\nyum -y install gcc\nmake hiredis jemalloc linenoise lua\n# 进入src文件夹里面编译\nmake MALLOC=libc\n# 修改默认配置文件\nmv redis.conf redis-default.conf\n# 主redis.conf\nport 6379\ncluster-enabled yes\ncluster-config-file nodes.conf\ncluster-node-timeout 5000\nappendonly yes\ndaemonize yes\nprotected-mode no\n# 从redis.conf\nport 6380\ncluster-enabled yes\ncluster-config-file nodes.conf\ncluster-node-timeout 5000\nappendonly yes\ndaemonize yes\nprotected-mode no\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"启动redis实例"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#启动redis实例","aria-hidden":"true"}},[this._v("#")]),this._v(" 启动Redis实例")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("# 分别启动三主三从实例\n./redis-server ../redis.conf\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"开启集群"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#开启集群","aria-hidden":"true"}},[this._v("#")]),this._v(" 开启集群")])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[this._v("./redis-trib.rb create --replicas 1 192.168.0.195:6379 192.168.0.195:6380 192.168.0.55:6379 192.168.0.55:6380 192.168.0.233:6379 192.168.0.233:6380\n\n")])])])}],!1,null,null,null);a.options.__file="Redis-Cluster.md";t.default=a.exports}}]);