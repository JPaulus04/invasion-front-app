(function () {
  'use strict';

  var QUEUE_KEY = 'lsc_game_center_queue_v1';
  var LOCAL_KEY = 'lsc_game_center_records_v1';
  var state = { available: false, authenticated: false, playerName: '', syncing: false };
  var LEADERBOARDS = Object.freeze({
    campaign: 'com.paulus.laststandcommand.leaderboard.campaign',
    containment: 'com.paulus.laststandcommand.leaderboard.containment',
    junkyard: 'com.paulus.laststandcommand.leaderboard.junkyard'
  });
  var ACHIEVEMENTS = Object.freeze({
    firstDeployment: 'com.paulus.laststandcommand.achievement.first_deployment',
    sectorSecured: 'com.paulus.laststandcommand.achievement.sector_secured',
    siegeBreaker: 'com.paulus.laststandcommand.achievement.siege_breaker',
    juggernautBreached: 'com.paulus.laststandcommand.achievement.juggernaut_breached',
    outbreakPrime: 'com.paulus.laststandcommand.achievement.outbreak_prime',
    hqSurvivor: 'com.paulus.laststandcommand.achievement.hq_survivor',
    containmentSpecialist: 'com.paulus.laststandcommand.achievement.containment_specialist',
    convoyCrusher: 'com.paulus.laststandcommand.achievement.convoy_crusher',
    phase25: 'com.paulus.laststandcommand.achievement.phase_25',
    phase50: 'com.paulus.laststandcommand.achievement.phase_50'
  });

  function nativePlugin() { return window.LSCGameCenterNative || null; }
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function emit() { window.dispatchEvent(new CustomEvent('lsc-game-center-state', { detail: status() })); }
  function status() { return { available: state.available, authenticated: state.authenticated, playerName: state.playerName, syncing: state.syncing }; }
  function records() { return read(LOCAL_KEY, { scores: {}, achievements: {} }); }
  function saveRecords(value) { write(LOCAL_KEY, value); }
  function queue() { return read(QUEUE_KEY, []); }
  function saveQueue(value) { write(QUEUE_KEY, value); }

  function enqueue(item) {
    var pending = queue(), local = records();
    if (item.type === 'score') {
      var previous = Number(local.scores[item.id]) || 0;
      if (item.value <= previous) return Promise.resolve(false);
      local.scores[item.id] = item.value;
      pending = pending.filter(function (entry) { return !(entry.type === 'score' && entry.id === item.id); });
    } else {
      if (local.achievements[item.id]) return Promise.resolve(false);
      local.achievements[item.id] = true;
      pending = pending.filter(function (entry) { return !(entry.type === 'achievement' && entry.id === item.id); });
    }
    pending.push(item); saveRecords(local); saveQueue(pending);
    return flush().then(function () { return true; });
  }

  function flush() {
    var plugin = nativePlugin(), pending = queue();
    if (!plugin || !state.authenticated || state.syncing || !pending.length) return Promise.resolve();
    state.syncing = true; emit();
    var remaining = [];
    return pending.reduce(function (chain, item) {
      return chain.then(function () {
        var request = item.type === 'score'
          ? plugin.reportScore({ leaderboardId: item.id, score: item.value })
          : plugin.reportAchievement({ achievementId: item.id, percentComplete: 100 });
        return Promise.resolve(request).catch(function () { remaining.push(item); });
      });
    }, Promise.resolve()).then(function () {
      saveQueue(remaining); state.syncing = false; emit();
    }).catch(function () { state.syncing = false; emit(); });
  }

  function initialize() {
    var plugin = nativePlugin();
    state.available = !!plugin; emit();
    if (!plugin) return Promise.resolve(status());
    return Promise.resolve(plugin.authenticate()).then(function (result) {
      state.authenticated = !!(result && result.authenticated);
      state.playerName = result && result.playerName || '';
      emit(); return flush();
    }).catch(function () { state.authenticated = false; emit(); }).then(status);
  }

  function showDashboard(section) {
    var plugin = nativePlugin();
    if (!plugin) return Promise.resolve(false);
    var ready = state.authenticated ? Promise.resolve() : initialize();
    return ready.then(function () {
      if (!state.authenticated) return false;
      return plugin.showDashboard({ section: section || 'dashboard' }).then(function () { return true; });
    }).catch(function () { return false; });
  }

  window.LSCGameCenter = Object.freeze({
    leaderboards: LEADERBOARDS,
    achievements: ACHIEVEMENTS,
    initialize: initialize,
    status: status,
    flush: flush,
    showDashboard: showDashboard,
    reportCampaignPhase: function (phase, eligible) {
      if (!eligible) return Promise.resolve(false);
      return enqueue({ type: 'score', id: LEADERBOARDS.campaign, value: Math.max(1, Math.floor(Number(phase) || 1)) });
    },
    reportOperationLevel: function (kind, level, eligible) {
      if (!eligible || (kind !== 'containment' && kind !== 'junkyard')) return Promise.resolve(false);
      return enqueue({ type: 'score', id: LEADERBOARDS[kind], value: Math.max(1, Math.floor(Number(level) || 1)) });
    },
    unlock: function (key, eligible) {
      var id = ACHIEVEMENTS[key];
      if (!eligible || !id) return Promise.resolve(false);
      return enqueue({ type: 'achievement', id: id, value: 100 });
    }
  });
})();
