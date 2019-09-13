const _ = require('lodash');

const images = require('express').Router({mergeParams: true});

const imageDecoratorService = require('../../services/image.decorator.service');

images.get('/decorate/kitty/:kittyId/bandana', async (req, res, next) => {
    try {
        const {kittyId} = req.params;

        const png = await generatePng(kittyId);

        res.setHeader('Content-Type', 'image/png');

        return res
            .status(200)
            .send(png);

    } catch (e) {
        next(e);
    }
});

const generatePng = async (kittyId) => {
    const svgRaw = `https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/${kittyId}.svg`;

    const builtSvg = await imageDecoratorService.overlayBandana(svgRaw);

    return await convert(builtSvg, {
        height: 1200,
        puppeteer: {args: ['--no-sandbox', '--disable-setuid-sandbox']}
    });
};

module.exports = images;
