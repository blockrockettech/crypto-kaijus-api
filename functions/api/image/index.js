const _ = require('lodash');

const images = require('express').Router({mergeParams: true});

const imageDecoratorService = require('../../services/image.decorator.service');

images.get('/decorate/kitty/:kittyId/bandana', async (req, res, next) => {
    try {
        const {kittyId} = req.params;

        const svgRaw = `https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/${kittyId}.svg`;

        const builtSvg = await imageDecoratorService.overlayBandana(svgRaw);

        res.setHeader('Content-Type', 'image/svg+xml');

        return res
            .status(200)
            .send(builtSvg);

    } catch (e) {
        next(e);
    }
});

module.exports = images;
