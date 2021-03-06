/* This is a shared file between Fireplace and Transonic. */
define('feed',
    ['l10n', 'models', 'nunjucks', 'underscore', 'utils_local'], function(l10n, models, nunjucks, _, utils_local) {
    'use strict';
    var gettext = l10n.gettext;

    var BRAND_TYPES = {
        'apps-for-albania': [gettext('App for Albania'), gettext('Apps for Albania')],
        'apps-for-argentina': [gettext('App for Argentina'), gettext('Apps for Argentina')],
        'apps-for-bangladesh': [gettext('App for Bangladesh'), gettext('Apps for Bangladesh')],
        'apps-for-brazil': [gettext('App for Brazil'), gettext('Apps for Brazil')],
        'apps-for-bulgaria': [gettext('App for Bulgaria'), gettext('Apps for Bulgaria')],
        'apps-for-chile': [gettext('App for Chile'), gettext('Apps for Chile')],
        'apps-for-china': [gettext('App for China'), gettext('Apps for China')],
        'apps-for-colombia': [gettext('App for Colombia'), gettext('Apps for Colombia')],
        'apps-for-costa-rica': [gettext('App for Costa Rica'), gettext('Apps for Costa Rica')],
        'apps-for-croatia': [gettext('App for Croatia'), gettext('Apps for Croatia')],
        'apps-for-czech-republic': [gettext('App for Czech Republic'), gettext('Apps for Czech Republic')],
        'apps-for-ecuador': [gettext('App for Ecuador'), gettext('Apps for Ecuador')],
        'apps-for-el-salvador': [gettext('App for El Salvador'), gettext('Apps for El Salvador')],
        'apps-for-france': [gettext('App for France'), gettext('Apps for France')],
        'apps-for-germany': [gettext('App for Germany'), gettext('Apps for Germany')],
        'apps-for-greece': [gettext('App for Greece'), gettext('Apps for Greece')],
        'apps-for-hungary': [gettext('App for Hungary'), gettext('Apps for Hungary')],
        'apps-for-india': [gettext('App for India'), gettext('Apps for India')],
        'apps-for-italy': [gettext('App for Italy'), gettext('Apps for Italy')],
        'apps-for-japan': [gettext('App for Japan'), gettext('Apps for Japan')],
        'apps-for-macedonia': [gettext('App for Macedonia'), gettext('Apps for Macedonia')],
        'apps-for-mexico': [gettext('App for Mexico'), gettext('Apps for Mexico')],
        'apps-for-montenegro': [gettext('App for Montenegro'), gettext('Apps for Montenegro')],
        'apps-for-nicaragua': [gettext('App for Nicaragua'), gettext('Apps for Nicaragua')],
        'apps-for-panama': [gettext('App for Panama'), gettext('Apps for Panama')],
        'apps-for-peru': [gettext('App for Peru'), gettext('Apps for Peru')],
        'apps-for-poland': [gettext('App for Poland'), gettext('Apps for Poland')],
        'apps-for-russia': [gettext('App for Russia'), gettext('Apps for Russia')],
        'apps-for-serbia': [gettext('App for Serbia'), gettext('Apps for Serbia')],
        'apps-for-south-africa': [gettext('App for South Africa'), gettext('Apps for South Africa')],
        'apps-for-spain': [gettext('App for Spain'), gettext('Apps for Spain')],
        'apps-for-uruguay': [gettext('App for Uruguay'), gettext('Apps for Uruguay')],
        'apps-for-venezuela': [gettext('App for Venezuela'), gettext('Apps for Venezuela')],
        'arts-entertainment': [gettext('Arts & Entertainment'), gettext('Arts & Entertainment')],
        'book': [gettext('Book'), gettext('Books')],
        'creativity': [gettext('Creativity'), gettext('Creativity')],
        'education': [gettext('Education'), gettext('Education')],
        'games': [gettext('Game'), gettext('Games')],
        'groundbreaking': [gettext('Groundbreaking'), gettext('Groundbreaking')],
        'health-fitness': [gettext('Health & Fitness'), gettext('Health & Fitness')],
        'hidden-gem': [gettext('Hidden Gem'), gettext('Hidden Gems')],
        'lifestyle': [gettext('Lifestyle'), gettext('Lifestyle')],
        'local-favorite': [gettext('Local Favorite'), gettext('Local Favorites')],
        'maps-navigation': [gettext('Maps & Navigation'), gettext('Maps & Navigation')],
        'music': [gettext('Music'), gettext('Music')],
        'mystery-app': [gettext('Mystery App!'), gettext('Mystery Apps!')],
        'news-weather': [gettext('News & Weather'), gettext('News & Weather')],
        'photo-video': [gettext('Photo & Video'), gettext('Photo & Video')],
        'shopping': [gettext('Shopping'), gettext('Shopping')],
        'social': [gettext('Social'), gettext('Social')],
        'sports': [gettext('Sports'), gettext('Sports')],
        'tools-time-savers': [gettext('Tools & Time Saver'), gettext('Tools & Time Savers')],
        'travel': [gettext('Travel'), gettext('Travel')],
        'work-business': [gettext('Work & Business'), gettext('Work & Business')]
    };

    var BRAND_TYPES_CHOICES = utils_local.items(BRAND_TYPES);

    var BRAND_LAYOUTS = {
        'grid': gettext('Grid Layout'),
        'list': gettext('List Layout'),
    };

    var BRAND_LAYOUTS_CHOICES = utils_local.items(BRAND_LAYOUTS);

    var BRAND_COLORS = [
        'ruby',
        'amber',
        'emerald',
        'topaz',
        'sapphire',
        'amethyst',
        'garnet'
    ];

    var FEEDAPP_ICON = 'icon';
    var FEEDAPP_IMAGE = 'image';
    var FEEDAPP_DESC = 'description';
    var FEEDAPP_QUOTE = 'quote';
    var FEEDAPP_PREVIEW = 'preview';

    var FEEDAPP_TYPES = {
        'icon': gettext('Icon'),
        'image': gettext('Background Image'),
        'description': gettext('Description'),
        'quote': gettext('Quote'),
        'preview': gettext('Screenshot'),
    };

    var COLL_PROMO = 'promo';
    var COLL_LISTING = 'listing';
    var COLL_OPERATOR = 'operator';

    var COLL_TYPES = {
        'promo': gettext('Promo Collection'),
        'listing': gettext('Listing Collection'),
    };

    function get_brand_name(item) {
        if (item.apps.length > 1) {
            return BRAND_TYPES[item.type][1];
        }
        return BRAND_TYPES[item.type][0];
    }

    function get_brand_color_class(brand) {
        /*
        Passed the JSON representation of an editorial brand, returns a random
        CSS class to be used to colorify that brand's display.
        */

        function identifier(brand) {
            // Generate a unique identifier from the brand.
            var brand_id = brand.type;
            _.each(brand.apps, function(app) {
                brand_id += '_' + app.slug;
            });
            return brand_id;
        }

        function charcode_sum(str) {
            // Sum the charcodes of each character in a passed string.
            var sum = 0;
            for(var i = 0, length = str.length; i < length; i++) {
                sum += str.charCodeAt(i);
            }
            return sum;
        }

        function seeded_random(seed) {
            // Generate a seeded random float between 0 and 1 using the passed
            // integer as a seed.
            var rand = Math.sin(seed++) * 10000;
            return rand - Math.floor(rand);
        }

        var brand_id = identifier(brand);
        var seed = charcode_sum(brand_id);
        var random = seeded_random(seed);

        return BRAND_COLORS[Math.floor(random * BRAND_COLORS.length)];
    }

    function group_apps(apps) {
        // Breaks up a list of apps with group attributions into a list of
        // groups {'name': <str>, 'apps': <arr>}.
        if (!apps || !apps[0].group) {
            return apps;
        }

        var grouped_apps = [];
        var current_group = {
            name: apps[0].group,
            apps: []
        };

        for (var i = 0; i < apps.length; i++) {
            if (apps[i].group != current_group.name) {
                // New group.
                grouped_apps.push(current_group);
                current_group = {
                    name: apps[i].group,
                    apps: []
                };
            }
            current_group.apps.push(apps[i]);
        }
        grouped_apps.push(current_group);

        return grouped_apps;
    }

    var MAX_BRAND_APPS = 6;

    return {
        BRAND_TYPES: BRAND_TYPES,
        BRAND_TYPES_CHOICES: BRAND_TYPES_CHOICES,
        BRAND_LAYOUTS: BRAND_LAYOUTS,
        BRAND_LAYOUTS_CHOICES: BRAND_LAYOUTS_CHOICES,
        COLL_PROMO: COLL_PROMO,
        COLL_LISTING: COLL_LISTING,
        COLL_OPERATOR: COLL_OPERATOR,
        COLL_TYPES: COLL_TYPES,
        FEEDAPP_ICON: FEEDAPP_ICON,
        FEEDAPP_IMAGE: FEEDAPP_IMAGE,
        FEEDAPP_DESC: FEEDAPP_DESC,
        FEEDAPP_QUOTE: FEEDAPP_QUOTE,
        FEEDAPP_PREVIEW: FEEDAPP_PREVIEW,
        FEEDAPP_TYPES: FEEDAPP_TYPES,
        cast_feed_app: models('feed-app').cast,
        cast_brand: models('feed-brand').cast,
        cast_collection: models('feed-collection').cast,
        cast_shelf: models('feed-shelf').cast,
        get_brand_color_class: get_brand_color_class,
        get_brand_name: get_brand_name,
        group_apps: group_apps,
        MAX_BRAND_APPS: MAX_BRAND_APPS,
    };
});
