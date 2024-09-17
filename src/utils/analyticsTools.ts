// this code is related to implementing the A/B testing tool VMO: https://vwo.com/
// Whenever this script is updated, ensure that any changes are reflected in the
// error handling in App.tsx, especially for any elements that change opacity of the page.
/* eslint-disable */
// @ts-nocheck
export const executeVWO = () => {
  window._vwo_code =
    window._vwo_code ||
    (function () {
      var account_id = 634566,
        version = 1.5,
        settings_tolerance = 2000,
        library_tolerance = 2500,
        use_existing_jquery = false,
        is_spa = 1,
        hide_element = '',
        hide_element_style = '',
        /* DO NOT EDIT BELOW THIS LINE */
        f = false,
        d = document,
        vwoCodeEl = d.querySelector('#vwoCode'),
        code = {
          use_existing_jquery: function () {
            return use_existing_jquery
          },
          library_tolerance: function () {
            return library_tolerance
          },
          hide_element_style: function () {
            return '{' + hide_element_style + '}'
          },
          finish: function () {
            if (!f) {
              f = true
              var e = d.getElementById('_vis_opt_path_hides')
              if (e) e.parentNode.removeChild(e)
            }
          },
          finished: function () {
            return f
          },
          load: function (e) {
            var t = d.createElement('script')
            t.fetchPriority = 'high'
            t.src = e
            t.type = 'text/javascript'
            t.onerror = function () {
              _vwo_code.finish()
            }
            d.getElementsByTagName('head')[0].appendChild(t)
          },
          getVersion: function () {
            return version
          },
          getMatchedCookies: function (e) {
            var t = []
            if (document.cookie) {
              t = document.cookie.match(e) || []
            }
            return t
          },
          getCombinationCookie: function () {
            var e = code.getMatchedCookies(
              /(?:^|;)\s?(_vis_opt_exp_\d+_combi=[^;$]*)/gi
            )
            e = e.map(function (e) {
              try {
                var t = decodeURIComponent(e)
                if (!/_vis_opt_exp_\d+_combi=(?:\d+,?)+\s*$/.test(t)) {
                  return ''
                }
                return t
              } catch (e) {
                return ''
              }
            })
            var i = []
            e.forEach(function (e) {
              var t = e.match(/([\d,]+)/g)
              t && i.push(t.join('-'))
            })
            return i.join('|')
          },
          init: function () {
            if (d.URL.indexOf('__vwo_disable__') > -1) return
            window.settings_timer = setTimeout(function () {
              _vwo_code.finish()
            }, settings_tolerance)
            var e = d.createElement('style'),
              t = hide_element
                ? hide_element + '{' + hide_element_style + '}'
                : '',
              i = d.getElementsByTagName('head')[0]
            e.setAttribute('id', '_vis_opt_path_hides')
            vwoCodeEl && e.setAttribute('nonce', vwoCodeEl.nonce)
            e.setAttribute('type', 'text/css')
            if (e.styleSheet) e.styleSheet.cssText = t
            else e.appendChild(d.createTextNode(t))
            i.appendChild(e)
            var n = this.getCombinationCookie()
            this.load(
              'https://dev.visualwebsiteoptimizer.com/j.php?a=' +
                account_id +
                '&u=' +
                encodeURIComponent(d.URL) +
                '&f=' +
                +is_spa +
                '&vn=' +
                version +
                (n ? '&c=' + n : '')
            )
            return settings_timer
          },
        }
      window._vwo_settings_timer = code.init()
      return code
    })()
}

export const executeHeap = () => {
  ;(window.heapReadyCb = window.heapReadyCb || []),
    (window.heap = window.heap || []),
    (heap.load = function (e, t) {
      ;(window.heap.envId = e),
        (window.heap.clientConfig = t = t || {}),
        (window.heap.clientConfig.shouldFetchServerConfig = !1)
      var a = document.createElement('script')
      ;(a.type = 'text/javascript'),
        (a.async = !0),
        (a.src = 'https://cdn.us.heap-api.com/config/' + e + '/heap_config.js')
      var r = document.getElementsByTagName('script')[0]
      r.parentNode.insertBefore(a, r)
      var n = [
          'init',
          'startTracking',
          'stopTracking',
          'track',
          'resetIdentity',
          'identify',
          'getSessionId',
          'getUserId',
          'getIdentity',
          'addUserProperties',
          'addEventProperties',
          'removeEventProperty',
          'clearEventProperties',
          'addAccountProperties',
          'addAdapter',
          'addTransformer',
          'addTransformerFn',
          'onReady',
          'addPageviewProperties',
          'removePageviewProperty',
          'clearPageviewProperties',
          'trackPageview',
        ],
        i = function (e) {
          return function () {
            var t = Array.prototype.slice.call(arguments, 0)
            window.heapReadyCb.push({
              name: e,
              fn: function () {
                heap[e] && heap[e].apply(heap, t)
              },
            })
          }
        }
      for (var p = 0; p < n.length; p++) heap[n[p]] = i(n[p])
    })
  heap.load('1919519062')
}
