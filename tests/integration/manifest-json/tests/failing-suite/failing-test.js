$(function () {

    QUnit.module("failing tests", {});

    QUnit.test('should fail comparing objects', function (assert) {
        var one = {some: "content", other: {stuff: "here"}},
            two = {some: "content", other: {stuff: "not here"}};

        assert.deepEqual(one, two, 'Should be the same although they aren\'t');
    });

    QUnit.test('should continue after async test even failing ', function (assert) {
        var ready = assert.async();
        assert.expect(1);
        setTimeout(function () {
                assert.ok(false, 'It is true, tho it is not');
                ready();
            },
            0
        );
    });

    QUnit.test('One passing test does not make it OK', function (assert) {
        assert.ok(true, 'So what, everything else is broken');
    });
});
