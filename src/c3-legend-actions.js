// c3 extension for legend item actions
(function() {

  // utility for method override
  function func_proxy(origin) {
    var before = []
        , wrap = []
        , after = []
        ;

    function extend() {
      var self = this
          , vals = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments)
          ;
      vals.forEach(function(v){ self.push(v); });
    }

    this.origin = origin;
    this.before = function() { extend.apply(before, arguments); };
    this.wrap = function() { extend.apply(wrap, arguments); };
    this.after = function() { extend.apply(after, arguments); };
    this.__run__ = function() {
      var self = this
          , args = arguments
          , wrapped = origin
          , result
          ;
      before.forEach(function(b) { b.apply(self, args); });
      wrap.forEach(function(w) { wrapped = w(origin); });
      result = wrapped.apply(self, args);
      after.forEach(function(a) { result = a.apply(self, args); });
      return result;
    };
    this.__run__.__proxy__ = this;
  }

  function override(name) {
    var origin = this[name]
        , proxy = (origin && origin.__proxy__) || new func_proxy(origin);
    this[name] = proxy.__run__;
    return proxy;
  }

  // depends on bootstrap, jquery and lodash
  var global = this, $ = global.jQuery, _ = global._, c3 = global.c3, d3 = global.d3;

  // setup local vars
  var c3_chart_internal_fn = c3.chart.internal.fn
      , CLASS = c3_chart_internal_fn.CLASS
      ;

  CLASS.legendItemActions = 'c3-legend-actions';

  c3_chart_internal_fn.override = override;

  c3_chart_internal_fn.additionalConfig = {
    legend_actions: null
  };

  c3_chart_internal_fn.override('init')
    .after(function() {
      this.initLegendItemActions();
    });

  // initialize the legend item actions elements and event handler
  c3_chart_internal_fn.initLegendItemActions = function() {
    var $$ = this, config = $$.config;

    if (_.isEmpty(config.legend_actions)) return;

    function createActionsMenu(actions) {
      var $menu = $('<ul>').addClass('dropdown-menu with-title ' + CLASS.legendItemActions);
      $menu.append('<li><span class="square"></span><span class="title">-</span></li><li class="divider"></li>');
      _(actions).forEach(function(action) {
        var $li = $('<li><a>')
            $a = $li.find('a')
            ;
        $a.append(action.bsicon ? '<i class="glyphicon glyphicon-' + action.bsicon + '"></i>' : action.icon)
          .append(action.text || action.name)
          .data('name', action.name);
        $menu.append($li);
      });
      $menu
        .find('li')
        .first().css({padding: '3px 20px', margin: '0px'})
        .find('span.square').css({width: '10px', height: '10px', display: 'inline-block', 'margin-right': '6px'});
      $menu.find('li>a>i').css('margin-right', 10);
      return $menu;
    }

    function getMenuPositionCss(id) {
      var rect =  $$.legend.select($$.selectorLegend(id)+' rect.'+$$.CLASS.legendItemEvent)
          , trans = d3.transform(d3.select($$.legend.node()).attr("transform")).translate
          ;

      if ($$.isLegendRight || $$.isLegendInset) {
        return {
          left: parseFloat(rect.attr('x')) + trans[0] - $menu.width() - 4,
          top: parseFloat(rect.attr('y')) + trans[1],
          position: 'absolute'
        };
      }
      else {
        return {
          left: parseFloat(rect.attr('x')) + trans[0],
          top: parseFloat(rect.attr('y')) + trans[1] - $menu.height() - 4,
          position: 'absolute'
        };
      }
    }

    var $c3 = $($$.selectChart.node())
        , $menu = createActionsMenu(config.legend_actions).hide();
        ;

    $c3.find('.' + CLASS.legendItemActions).remove();
    $c3.append($menu);

    // compatible with c3 api
    var legendIdWithActions = null,
        inActions = false, inLegend=false;

    $menu
      .on('mouseenter', function(){
        $menu.data('on', true);
      })
      .on('mouseleave', function(){
        $menu.removeData().hide().find('.title').text('-');
      });

    $menu.find('a').on('click', function() {
      var mdata = $menu.data();
      $menu.hide();
      _.filter(config.legend_actions, {name: $(this).data('name')})[0].callback.call(this, mdata.legendId);
    });

    override.call(config, 'legend_item_onmouseover').wrap(function(origin){
      return function(id) {
        $menu.css(getMenuPositionCss(id))
          .data({legendId: id, legendOn: true})
          .show()
          .find('.square')
          .css('background-color', config.data_colors[id])
          .next()
          .text(config.data_names[id] || id || '??');
        if (origin) {
          origin.call(this, id);
        }
      };
    });

    override.call(config, 'legend_item_onmouseout').wrap(function(origin){
      return function(id) {
        $menu.data('legendOn', false);
        setTimeout(function() {
          var data = $menu.data();
          if (!data.on && !data.legendOn) {
            $menu.hide();
          }
        }, 250);
        if (origin)
        {
          origin.call(this, id);
        }
      };
    });
  };

})();
